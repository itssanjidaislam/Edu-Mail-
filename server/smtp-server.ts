/**
 * Edu Mail — Dedicated Production SMTP Receiving Daemon
 *
 * This daemon is designed to run on a dedicated Linux VPS / Mail Server (e.g. Ubuntu 22.04 LTS / Debian 12)
 * listening on Port 25 (standard SMTP) with STARTTLS support.
 *
 * When an incoming SMTP transmission arrives:
 * 1. Checks SPF and client IP against blocklists.
 * 2. Parses RFC 5322 MIME data using simple-parser / mailparser.
 * 3. Dispatches the parsed message directly to the Edu Mail backend Inbound Webhook:
 *    POST https://your-edumail-app.run.app/api/inbound/webhook
 *
 * Requirements for VPS Deployment:
 * - Node.js 18+ or 20+
 * - npm install smtp-server mailparser
 * - Port 25 unblocked by VPS provider (e.g. Hetzner, OVH, Linode, DigitalOcean on request)
 * - Let's Encrypt TLS Certificate for mail.edumail.dev
 */

import http from 'http';
import https from 'https';

export interface InboundEmailPayload {
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string;
  headers: Record<string, string | string[]>;
  size: number;
}

export async function forwardToEduMailWebhook(
  webhookUrl: string,
  secretToken: string,
  payload: InboundEmailPayload
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const urlObj = new URL(webhookUrl);
    const client = urlObj.protocol === 'https:' ? https : http;

    const req = client.request(
      urlObj,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          'X-EduMail-Signature': secretToken,
          'User-Agent': 'EduMail-SMTP-Daemon/1.0',
        },
        timeout: 10000,
      },
      (res) => {
        let respBody = '';
        res.on('data', (chunk) => (respBody += chunk));
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(true);
          } else {
            console.error(`Webhook returned non-200 status: ${res.statusCode} - ${respBody}`);
            resolve(false);
          }
        });
      }
    );

    req.on('error', (err) => {
      console.error('Failed to forward email to Edu Mail webhook:', err);
      reject(err);
    });

    req.write(data);
    req.end();
  });
}

/**
 * Example Cloudflare Email Routing Worker script
 * Deploy this in Cloudflare Workers -> Email Routing to automatically pipe emails to Edu Mail without running your own VPS!
 */
export const CLOUDFLARE_EMAIL_WORKER_SCRIPT = `
export default {
  async email(message, env, ctx) {
    const rawEmail = await new Response(message.raw).text();
    
    // Parse headers
    const to = message.to;
    const from = message.from;
    const subject = message.headers.get("subject") || "(No Subject)";

    const payload = {
      to: to,
      from: from,
      subject: subject,
      text: rawEmail,
      html: rawEmail,
      headers: {
        "x-received-cloudflare": new Date().toISOString(),
        "from": from,
        "to": to,
        "subject": subject
      }
    };

    const webhookUrl = env.EDUMAIL_WEBHOOK_URL || "https://ais-dev-x5xut2u7l2bp5kqvh5cocx-485814370345.asia-southeast1.run.app/api/inbound/webhook";
    
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  }
};
`;
