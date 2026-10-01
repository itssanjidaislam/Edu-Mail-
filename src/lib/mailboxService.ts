import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase.ts';
import { Mailbox, Message, DomainConfig } from './types.ts';

const ACTIVE_MAILBOX_STORAGE_KEY = 'edumail_active_mailbox_id';

export const DEFAULT_DOMAINS: DomainConfig[] = [
  {
    id: 'edumail.com',
    isActive: true,
    priority: 1,
    mxConfigured: true,
    spfConfigured: true,
    dkimConfigured: true,
    notes: 'Primary operator domain with Cloudflare Email Routing & MX records configured.',
  },
  {
    id: 'tempmail.live',
    isActive: true,
    priority: 2,
    mxConfigured: true,
    spfConfigured: true,
    dkimConfigured: true,
    notes: 'Secondary isolated disposable route for high-volume verification.',
  },
  {
    id: 'studentmail.net',
    isActive: true,
    priority: 3,
    mxConfigured: true,
    spfConfigured: true,
    dkimConfigured: false,
    notes: 'Utility domain for student developer sandboxes.',
  },
  {
    id: 'quickinbox.org',
    isActive: true,
    priority: 4,
    mxConfigured: true,
    spfConfigured: true,
    dkimConfigured: true,
    notes: 'High-speed secure verification inbox.',
  },
];

const CUSTOM_DOMAINS_STORAGE_KEY = 'edumail_user_custom_domains';

export function getCustomDomains(): DomainConfig[] {
  try {
    const stored = localStorage.getItem(CUSTOM_DOMAINS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error(e);
  }
  return [];
}

export function addUserCustomDomain(domain: string): DomainConfig[] {
  const clean = domain.toLowerCase().trim().replace(/[^a-z0-9.-]/g, '');
  if (!clean || clean.length < 4) return getCustomDomains();
  
  const current = getCustomDomains();
  if (current.some(d => d.id === clean)) return current;

  const newConfig: DomainConfig = {
    id: clean,
    isActive: true,
    priority: 0,
    mxConfigured: true,
    spfConfigured: true,
    dkimConfigured: true,
    notes: 'User Private Custom Domain (Anti-Block Shield)',
  };

  const updated = [newConfig, ...current];
  try {
    localStorage.setItem(CUSTOM_DOMAINS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }
  return updated;
}

/**
 * Generate cryptographically secure random local username
 */
export function generateRandomUsername(prefix = 'user'): string {
  const bytes = new Uint8Array(6);
  window.crypto.getRandomValues(bytes);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `${prefix}_${hex}`;
}

/**
 * Generate unique Mailbox ID
 */
export function generateMailboxId(): string {
  const bytes = new Uint8Array(12);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Create a new temporary mailbox in Firestore (supports custom user-defined or random username)
 */
export async function createTemporaryMailbox(
  domain = 'edumail.com',
  durationMinutes = 99999,
  customUsername?: string
): Promise<Mailbox> {
  let username = customUsername ? customUsername.toLowerCase().trim().replace(/[^a-z0-9._-]/g, '') : '';
  
  if (!username || username.length < 3) {
    username = generateRandomUsername();
  } else {
    // Truncate if too long
    username = username.substring(0, 64);
  }

  const address = `${username}@${domain}`;
  const mailboxId = generateMailboxId();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000).toISOString();

  const mailbox: Mailbox = {
    id: mailboxId,
    address,
    username,
    domain,
    createdAt: now.toISOString(),
    expiresAt,
    status: 'active',
    messageCount: 0,
  };

  const path = `mailboxes/${mailboxId}`;
  try {
    await setDoc(doc(db, 'mailboxes', mailboxId), mailbox);
    localStorage.setItem(ACTIVE_MAILBOX_STORAGE_KEY, mailboxId);
    return mailbox;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Retrieve active mailbox from storage if valid and not expired
 */
export async function getStoredActiveMailbox(): Promise<Mailbox | null> {
  const storedId = localStorage.getItem(ACTIVE_MAILBOX_STORAGE_KEY);
  if (!storedId) return null;

  try {
    const snap = await getDoc(doc(db, 'mailboxes', storedId));
    if (!snap.exists()) {
      localStorage.removeItem(ACTIVE_MAILBOX_STORAGE_KEY);
      return null;
    }
    const data = snap.data() as Mailbox;
    // Check if expired
    if (new Date(data.expiresAt).getTime() <= Date.now() || data.status !== 'active') {
      return {
        ...data,
        status: 'expired',
      };
    }
    return data;
  } catch (error) {
    console.error('Failed to restore active mailbox:', error);
    return null;
  }
}

/**
 * Subscribe to real-time messages for an active mailbox
 */
export function subscribeToMailboxMessages(
  mailboxId: string,
  onUpdate: (messages: Message[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const messagesCol = collection(db, 'mailboxes', mailboxId, 'messages');
  const q = query(messagesCol, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const messages: Message[] = [];
      snapshot.forEach((docSnap) => {
        messages.push(docSnap.data() as Message);
      });
      onUpdate(messages);
    },
    (error) => {
      console.error('Messages subscription error:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Mark a message as read
 */
export async function markMessageRead(mailboxId: string, messageId: string): Promise<void> {
  const path = `mailboxes/${mailboxId}/messages/${messageId}`;
  try {
    await updateDoc(doc(db, 'mailboxes', mailboxId, 'messages', messageId), {
      isRead: true,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Delete a specific message
 */
export async function deleteMessage(mailboxId: string, messageId: string): Promise<void> {
  const path = `mailboxes/${mailboxId}/messages/${messageId}`;
  try {
    await deleteDoc(doc(db, 'mailboxes', mailboxId, 'messages', messageId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Delete / terminate entire mailbox
 */
export async function deleteMailbox(mailboxId: string): Promise<void> {
  const path = `mailboxes/${mailboxId}`;
  try {
    // Delete messages in subcollection first
    const messagesCol = collection(db, 'mailboxes', mailboxId, 'messages');
    const msgSnaps = await getDocs(messagesCol);
    for (const msg of msgSnaps.docs) {
      await deleteDoc(msg.ref);
    }
    // Delete mailbox doc
    await deleteDoc(doc(db, 'mailboxes', mailboxId));
    localStorage.removeItem(ACTIVE_MAILBOX_STORAGE_KEY);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Extend mailbox expiration by extra minutes
 */
export async function extendMailboxTime(mailboxId: string, extraMinutes = 10): Promise<string> {
  const snap = await getDoc(doc(db, 'mailboxes', mailboxId));
  if (!snap.exists()) throw new Error('Mailbox does not exist');
  const current = snap.data() as Mailbox;

  const currentExpiry = new Date(current.expiresAt).getTime();
  const baseTime = currentExpiry > Date.now() ? currentExpiry : Date.now();
  const newExpiry = new Date(baseTime + extraMinutes * 60 * 1000).toISOString();

  await updateDoc(doc(db, 'mailboxes', mailboxId), {
    expiresAt: newExpiry,
    status: 'active',
  });

  return newExpiry;
}
