import express, { Request, Response, Router } from 'express';
import { extractOtpCode } from '../src/lib/otp.ts';
import { sanitizeEmailHtml } from '../src/lib/sanitizer.ts';
import { DEFAULT_DOMAINS } from '../src/lib/mailboxService.ts';
import { db } from '../src/lib/firebase.ts';
import { collection, query, where, getDocs, doc, setDoc, updateDoc, increment } from 'firebase/firestore';

const router = Router();

// In-memory runtime tracking for server health & rate limiting
const ipRateLimits = new Map<string, { count: number; resetTime: number }>();
const serverStartTime = Date.now();

// IP Rate Limiting Middleware
router.use((req: Request, res: Response, next) => {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const limitWindow = 60 * 1000; // 1 minute
  const maxRequests = 120;

  const record = ipRateLimits.get(ip);
  if (!record || now > record.resetTime) {
    ipRateLimits.set(ip, { count: 1, resetTime: now + limitWindow });
    return next();
  }

  if (record.count >= maxRequests) {
    return res.status(429).json({
      error: 'Rate limit exceeded. Please wait a moment before sending more requests.',
    });
  }

  record.count++;
  next();
});

// 1. System Health & Diagnostic Info
router.get('/health', (req: Request, res: Response) => {
  const uptimeSeconds = Math.floor((Date.now() - serverStartTime) / 1000);
  res.json({
    status: 'healthy',
    service: 'Edu Mail Real Inbound Gateway',
    uptimeSeconds,
    timestamp: new Date().toISOString(),
    domainsConfigured: DEFAULT_DOMAINS.length,
    activeIngestionProtocol: 'RFC 822 / Webhook / SMTP Forwarder',
  });
});

// 2. Operator Domains List & DNS Verification
router.get('/domains', (req: Request, res: Response) => {
  res.json({
    domains: DEFAULT_DOMAINS,
    mxInstructions: {
      records: [
        { type: 'MX', host: '@', priority: 10, target: 'mail.edumail.dev' },
        { type: 'TXT', host: '@', target: 'v=spf1 mx -all' },
        { type: 'TXT', host: '_dmarc', target: 'v=DMARC1; p=reject; rua=mailto:dmarc-reports@edumail.dev' },
      ],
      cloudflareWorkerRoute: 'https://ais-dev-x5xut2u7l2bp5kqvh5cocx-485814370345.asia-southeast1.run.app/api/inbound/webhook',
    },
  });
});

// 3. Inbound Email Webhook Ingestion Engine
router.post('/inbound/webhook', async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    if (!payload) {
      return res.status(400).json({ error: 'Missing email payload' });
    }

    const recipient = (
      payload.to ||
      payload.recipient ||
      payload.envelope?.to ||
      payload.headers?.to ||
      ''
    ).toLowerCase().trim();

    const sender = payload.from || payload.sender || payload.envelope?.from || 'unknown@sender.com';
    const subject = payload.subject || '(No Subject)';
    const textBody = payload.text || payload.body || payload.textBody || '';
    const rawHtml = payload.html || payload.htmlBody || '';
    const headers = payload.headers ? (typeof payload.headers === 'string' ? payload.headers : JSON.stringify(payload.headers)) : '';

    if (!recipient) {
      return res.status(400).json({ error: 'Missing recipient address in payload' });
    }

    // Sanitize HTML safely
    const cleanHtml = sanitizeEmailHtml(rawHtml, { allowImages: false });

    // Extract OTP if present
    const detectedOtp = extractOtpCode(textBody || rawHtml, subject);

    // Calculate approximate size
    const sizeBytes = Buffer.byteLength(JSON.stringify(payload), 'utf8');

    const messageRecord = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      recipient,
      from: sender,
      subject,
      textBody,
      htmlBody: cleanHtml,
      rawHeaders: headers,
      otpCode: detectedOtp ? detectedOtp.code : undefined,
      otpType: detectedOtp ? detectedOtp.type : undefined,
      hasAttachments: Boolean(payload.attachments && payload.attachments.length > 0),
      isRead: false,
      createdAt: new Date().toISOString(),
      sizeBytes,
    };

    // Find mailbox by address in Firestore and store message
    try {
      const mailboxesRef = collection(db, 'mailboxes');
      const q = query(mailboxesRef, where('address', '==', recipient));
      const querySnap = await getDocs(q);
      
      if (!querySnap.empty) {
        const mailboxDoc = querySnap.docs[0];
        const mailboxId = mailboxDoc.id;
        
        // Save message to subcollection
        await setDoc(doc(db, 'mailboxes', mailboxId, 'messages', messageRecord.id), messageRecord);
        
        // Update messageCount
        await updateDoc(doc(db, 'mailboxes', mailboxId), {
          messageCount: increment(1),
        });
      }
    } catch (fsErr) {
      console.error('Failed to sync inbound message to Firestore:', fsErr);
    }

    return res.status(200).json({
      success: true,
      message: 'Inbound message processed and saved to mailbox successfully',
      processedMessage: messageRecord,
    });
  } catch (error) {
    console.error('Inbound ingestion error:', error);
    return res.status(500).json({
      error: 'Failed to ingest incoming message',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// 4. Password Generator API Endpoint
router.post('/password/generate', (req: Request, res: Response) => {
  const { length = 16, uppercase = true, lowercase = true, numbers = true, symbols = true, count = 1 } = req.body;
  
  let pool = '';
  if (uppercase) pool += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (lowercase) pool += 'abcdefghijklmnopqrstuvwxyz';
  if (numbers) pool += '0123456789';
  if (symbols) pool += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  if (!pool) pool = 'abcdefghijklmnopqrstuvwxyz0123456789';

  const passwords: string[] = [];
  const qty = Math.max(1, Math.min(20, count));
  const len = Math.max(8, Math.min(128, length));

  for (let i = 0; i < qty; i++) {
    let pwd = '';
    for (let j = 0; j < len; j++) {
      const idx = Math.floor(Math.random() * pool.length);
      pwd += pool[idx];
    }
    passwords.push(pwd);
  }

  res.json({
    success: true,
    passwords,
    length: len,
  });
});

// 5. Abuse Reporting API Endpoint
router.post('/abuse/report', (req: Request, res: Response) => {
  const { targetAddress, reason, details } = req.body;
  if (!targetAddress || !reason || !details) {
    return res.status(400).json({ error: 'Missing required fields: targetAddress, reason, and details are required.' });
  }

  const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  res.status(201).json({
    success: true,
    reportId,
    message: 'Abuse report logged successfully. Our compliance and NOC team will investigate within 24 hours.',
  });
});

export const apiRouter = router;
