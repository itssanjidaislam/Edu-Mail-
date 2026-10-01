/**
 * Safe, multi-pattern OTP / Verification Code Extractor
 * Identifies 4, 5, 6, and 8-digit verification codes using context-aware patterns.
 */

export interface OtpDetectionResult {
  code: string;
  type: string; // e.g. "6-digit OTP", "4-digit PIN", "8-digit Security Code"
  confidence: 'high' | 'medium';
}

const CONTEXT_PATTERNS = [
  // High confidence keywords: "verification code is 123456", "your security code: 123456"
  /(?:verification|verify|verifying|confirmation|confirm|security|auth|authentication|access|passcode|one-time|otp|pin)\s*(?:code|number|password|pin)?\s*(?:is|:|=|-|\bis\s+now\b)?\s*[:\s-]?\s*([0-9]{4,8})\b/i,
  // Format: "Code: 123456" or "OTP: 123456"
  /\b(?:OTP|PIN|CODE|Token)\s*[:#\s-]\s*([0-9]{4,8})\b/i,
  // Context like "use 123456 to log in" or "enter 123456 to confirm"
  /(?:use|enter|type|input)\s+([0-9]{4,8})\s+(?:to|for|in|as)\b/i,
  // Standalone lines with 4 to 8 digits
  /^\s*([0-9]{4,8})\s*$/m,
];

export function extractOtpCode(text: string, subject?: string): OtpDetectionResult | null {
  const combined = `${subject || ''}\n${text || ''}`;
  if (!combined.trim()) return null;

  for (const pattern of CONTEXT_PATTERNS) {
    const match = combined.match(pattern);
    if (match && match[1]) {
      const code = match[1].trim();
      const length = code.length;
      if (length >= 4 && length <= 8) {
        let type = `${length}-digit Verification Code`;
        if (length === 4) type = '4-digit PIN / Code';
        else if (length === 6) type = '6-digit OTP';
        else if (length === 8) type = '8-digit Security Code';

        return {
          code,
          type,
          confidence: 'high',
        };
      }
    }
  }

  // Secondary search for bolded or isolated numbers in subject line
  if (subject) {
    const subjectMatch = subject.match(/\b([0-9]{4,8})\b/);
    if (subjectMatch && subjectMatch[1]) {
      const code = subjectMatch[1];
      return {
        code,
        type: `${code.length}-digit Code`,
        confidence: 'medium',
      };
    }
  }

  return null;
}
