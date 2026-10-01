# Edu Mail — Production Temporary Email Platform & Secure Student Utilities

Edu Mail is an enterprise-grade, disposable email receiving system engineered for developers, QA testers, students, and privacy-conscious users. It features an automated verification OTP detection engine, zero-trust DOMPurify HTML sanitization, real-time message delivery, and an independent client-side cryptographic password generator.

---

## 1. System Architecture

```text
Internet (External Senders: Gmail / GitHub / Apple / Discord / AWS)
   │
   ▼
DNS Resolution (Authoritative MX records)
   │
   ├─► Ingestion Path A: Cloudflare Email Routing Worker (Zero-Server Inbound)
   │     └─► POST https://edumail-gateway/api/inbound/webhook
   │
   └─► Ingestion Path B: Dedicated SMTP Server (server/smtp-server.ts on Port 25)
         └─► Forwarder via TLS to /api/inbound/webhook
               │
               ▼
         RFC 5322 & MIME Parser
               │
               ▼
         Intelligent OTP Extractor (4, 5, 6, 8-digit verification PINs)
               │
               ▼
         DOMPurify HTML Sanitizer (XSS, Phishing, & Tracker neutralization)
               │
               ▼
         Database Persistence (Firestore / PostgreSQL collections: mailboxes & messages)
               │
               ▼
         Live Client Inbox (Real-time WebSocket / onSnapshot stream)
```

---

## 2. Production DNS & MX Configuration

Configure the following records on your operator-controlled domain registrar (Cloudflare, Route53, Namecheap, Google Domains):

| Type | Host | Priority | Value / Destination | Description |
| :--- | :--- | :--- | :--- | :--- |
| **MX** | `@` | `10` | `route1.mx.cloudflare.net` (or `mail.yourdomain.com`) | Primary Inbound Mail Exchanger |
| **MX** | `@` | `20` | `route2.mx.cloudflare.net` | Secondary Mail Exchanger |
| **MX** | `@` | `30` | `route3.mx.cloudflare.net` | Tertiary Mail Exchanger |
| **TXT** | `@` | `-` | `"v=spf1 include:_spf.mx.cloudflare.net -all"` | Sender Policy Framework (Strict) |
| **TXT** | `_dmarc` | `-` | `"v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s;"` | Strict DMARC Policy |
| **A / CNAME** | `mail` | `-` | `YOUR_SERVER_IP` or `your-app.run.app` | Mail Ingestion Gateway Host |

---

## 3. Deployment Guide

### Option A: Cloud Run / Containerized Full-Stack
1. Build the production application:
   ```bash
   npm run build
   ```
2. Start the Node.js production server:
   ```bash
   npm start
   ```

### Option B: Cloudflare Email Routing (Recommended Zero-Maintenance)
1. Add your custom domain to Cloudflare.
2. Enable **Email Routing**.
3. Create a Catch-all routing rule to trigger a Cloudflare Worker using the script located in `server/smtp-server.ts` (`CLOUDFLARE_EMAIL_WORKER_SCRIPT`).
4. Set the Worker environment variable `EDUMAIL_WEBHOOK_URL` to `https://your-edumail-domain/api/inbound/webhook`.

### Option C: Dedicated VPS Mail Server (Ubuntu 22.04 / Debian 12)
1. Verify port 25 is unblocked by your hosting provider.
2. Deploy `server/smtp-server.ts` using PM2 or systemd:
   ```bash
   pm2 start server/smtp-server.ts --name edumail-smtp
   ```

---

## 4. API Specification

### `POST /api/inbound/webhook`
Accepts incoming RFC / MIME email streams from mail forwarders.
- **Request Body:**
  ```json
  {
    "to": "user_1a2b3c@edumail.dev",
    "from": "verify@service.com",
    "subject": "Your Verification Code: 492819",
    "text": "Your OTP code is 492819",
    "html": "<p>Your OTP code is <b>492819</b></p>"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Inbound message processed successfully",
    "processedMessage": {
      "id": "msg_179088...",
      "otpCode": "492819",
      "otpType": "6-digit OTP"
    }
  }
  ```

### `POST /api/password/generate`
Generates cryptographically random passwords server-side for external API clients (Web client utilizes browser-side Web Crypto API).

### `POST /api/abuse/report`
Logs abuse tickets directly into the compliance database.

### `GET /api/health`
Health check probe returning uptime and active ingestion protocols.

---

## 5. Security & Privacy Hardening

- **HTML Sanitization:** DOMPurify strips all `<script>`, `<object>`, `<iframe>`, `<form>`, dangerous URL protocols (`javascript:`), and inline DOM event listeners.
- **Remote Images:** Remote tracker images are blocked by default to prevent sender IP logging.
- **Zero Password Storage:** The standalone password generator generates entropy in RAM via `crypto.getRandomValues`. Passwords are never sent across the network or stored.
- **Mailbox Shredding:** All mailboxes and messages expire within 10 minutes (configurable) and are automatically purged.
- **Institutional Non-Impersonation:** Operates strictly on operator-owned domains without impersonating accredited colleges or institutions.

---

## 6. Testing & Quality Assurance

Run the test suite and type verification:
```bash
npm run lint
npm run build
```
You can also dispatch real test messages directly in the UI via the **"Send Real Test Email"** tool on the home view to test end-to-end inbound reception, parsing, and OTP extraction.
