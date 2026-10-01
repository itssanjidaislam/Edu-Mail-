export interface Mailbox {
  id: string; // unique crypto random id
  address: string; // full address e.g. user_abc123@edumail.dev
  username: string;
  domain: string;
  createdAt: string; // ISO string
  expiresAt: string; // ISO string
  status: 'active' | 'expired' | 'deleted' | 'blocked';
  messageCount: number;
}

export interface Message {
  id: string;
  mailboxId: string;
  recipient: string;
  from: string;
  senderEmail?: string;
  subject: string;
  textBody?: string;
  htmlBody?: string;
  rawHeaders?: string;
  otpCode?: string;
  otpType?: string;
  hasAttachments: boolean;
  isRead: boolean;
  createdAt: string;
  sizeBytes?: number;
}

export interface DomainConfig {
  id: string; // domain name e.g. edumail.dev
  isActive: boolean;
  priority: number;
  mxConfigured: boolean;
  spfConfigured: boolean;
  dkimConfigured: boolean;
  notes?: string;
}

export interface AbuseReport {
  id: string;
  targetAddress: string;
  reporterEmail?: string;
  reason: 'spam' | 'phishing' | 'harassment' | 'fraud' | 'other';
  details: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface BlockedIp {
  ip: string;
  reason: string;
  blockedAt: string;
  expiresAt?: string;
}

export interface SystemSettings {
  mailboxLifetimeMinutes: number;
  maxMessagesPerMailbox: number;
  maxMessageSizeBytes: number;
  rateLimitPerHour: number;
  allowHtmlEmail: boolean;
  autoPurgeExpired: boolean;
}

export interface SecurityLog {
  id: string;
  action: string;
  ip?: string;
  details: string;
  timestamp: string;
}

export interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
  count: number;
}
