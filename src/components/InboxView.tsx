import React, { useState, useEffect } from 'react';
import {
  Inbox,
  RefreshCw,
  Trash2,
  Mail,
  MailOpen,
  Paperclip,
  Clock,
  ArrowLeft,
  Copy,
  Check,
  Shield,
  ShieldAlert,
  Eye,
  EyeOff,
  Code,
  AlertCircle,
  Key,
} from 'lucide-react';
import { Mailbox, Message } from '../lib/types.ts';
import {
  markMessageRead,
  deleteMessage,
  deleteMailbox,
} from '../lib/mailboxService.ts';
import { sanitizeEmailHtml, linkifyPlainText } from '../lib/sanitizer.ts';

interface InboxViewProps {
  mailbox: Mailbox | null;
  messages: Message[];
  onRefresh: () => Promise<void>;
  onCreateNew: () => void;
}

export const InboxView: React.FC<InboxViewProps> = ({
  mailbox,
  messages,
  onRefresh,
  onCreateNew,
}) => {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefreshSeconds, setAutoRefreshSeconds] = useState(10);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [allowImages, setAllowImages] = useState(false);
  const [showRawHeaders, setShowRawHeaders] = useState(false);
  const [viewMode, setViewMode] = useState<'html' | 'plain'>('html');

  // Auto-refresh countdown
  useEffect(() => {
    if (!mailbox) return;

    const timer = setInterval(() => {
      setAutoRefreshSeconds((prev) => {
        if (prev <= 1) {
          onRefresh().catch(console.error);
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mailbox, onRefresh]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
      setAutoRefreshSeconds(10);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSelectMessage = async (msg: Message) => {
    setSelectedMessage(msg);
    setAllowImages(false);
    setShowRawHeaders(false);
    if (!msg.isRead && mailbox) {
      try {
        await markMessageRead(mailbox.id, msg.id);
      } catch (err) {
        console.error('Failed to mark read:', err);
      }
    }
  };

  const handleDeleteCurrentMessage = async (msgId: string) => {
    if (!mailbox) return;
    try {
      await deleteMessage(mailbox.id, msgId);
      if (selectedMessage?.id === msgId) {
        setSelectedMessage(null);
      }
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  const handleDeleteAll = async () => {
    if (!mailbox || messages.length === 0) return;
    try {
      for (const msg of messages) {
        await deleteMessage(mailbox.id, msg.id);
      }
      setSelectedMessage(null);
    } catch (err) {
      console.error('Failed to clear messages:', err);
    }
  };

  const handleCopyOtp = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  const handleCopyAddress = () => {
    if (!mailbox) return;
    navigator.clipboard.writeText(mailbox.address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  if (!mailbox) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-4">
          <Inbox className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          No Active Mailbox Found
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6 text-sm">
          You don't currently have an active temporary mailbox. Generate an address to start receiving real verification emails.
        </p>
        <button
          onClick={onCreateNew}
          className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition-all cursor-pointer"
        >
          Generate Mailbox Now
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Mailbox Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div className="overflow-hidden text-left">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Active Temporary Address
            </span>
            <span className="font-mono font-bold text-sm sm:text-base text-slate-900 dark:text-white break-all">
              {mailbox.address}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleCopyAddress}
            className="px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedAddress ? 'Copied' : 'Copy Address'}</span>
          </button>

          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh ({autoRefreshSeconds}s)</span>
          </button>

          {messages.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="px-3 py-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Delete all messages"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Inbox</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Mail Layout: List or Viewer */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden min-h-[500px]">
        {selectedMessage ? (
          /* Secure Email Detail Viewer */
          <div className="flex flex-col h-full">
            {/* Viewer Navigation Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30">
              <button
                onClick={() => setSelectedMessage(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Inbox</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAllowImages(!allowImages)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
                    allowImages
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-700 dark:text-amber-400'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                  title="Toggle external image blocking"
                >
                  {allowImages ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{allowImages ? 'Hide Images' : 'Load Remote Images'}</span>
                </button>

                <button
                  onClick={() => setShowRawHeaders(!showRawHeaders)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
                    showRawHeaders
                      ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-300 text-indigo-700 dark:text-indigo-400'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Headers</span>
                </button>

                <button
                  onClick={() => handleDeleteCurrentMessage(selectedMessage.id)}
                  className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                  title="Delete this message"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Email Meta Details */}
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 space-y-3">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                {selectedMessage.subject || '(No Subject)'}
              </h2>

              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                <div className="space-y-1">
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">From: </span>
                    <span className="font-mono text-slate-900 dark:text-slate-200">{selectedMessage.from}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">To: </span>
                    <span className="font-mono">{selectedMessage.recipient}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(selectedMessage.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Verification Code / OTP Banner (if detected) */}
            {selectedMessage.otpCode && (
              <div className="m-5 sm:m-6 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border-2 border-amber-400/60 dark:border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-extrabold tracking-wider text-amber-800 dark:text-amber-300">
                        {selectedMessage.otpType || 'Verification Code Detected'}
                      </span>
                    </div>
                    <div className="font-mono text-2xl sm:text-3xl font-black tracking-widest text-slate-900 dark:text-white select-all">
                      {selectedMessage.otpCode}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleCopyOtp(selectedMessage.otpCode!)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                    copiedOtp
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20'
                  }`}
                >
                  {copiedOtp ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedOtp ? 'Code Copied!' : 'Copy Code'}</span>
                </button>
              </div>
            )}

            {/* Raw Headers Drawer */}
            {showRawHeaders && (
              <div className="mx-5 sm:mx-6 mb-4 p-4 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono overflow-x-auto max-h-60 border border-slate-700">
                <div className="font-bold text-slate-400 mb-2 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-400" />
                  <span>RFC Headers & Verification Envelope:</span>
                </div>
                <pre className="whitespace-pre-wrap break-all leading-relaxed">
                  {selectedMessage.rawHeaders || 'No raw headers preserved for this transmission.'}
                </pre>
              </div>
            )}

            {/* Email Body Content */}
            <div className="p-5 sm:p-6 flex-1 overflow-y-auto">
              {selectedMessage.htmlBody ? (
                <div>
                  {!allowImages && (
                    <div className="mb-4 p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs flex items-center justify-between gap-2">
                      <span>Remote images are blocked to protect your privacy and IP address.</span>
                      <button
                        onClick={() => setAllowImages(true)}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                      >
                        Display Images
                      </button>
                    </div>
                  )}

                  <div
                    className="prose prose-slate dark:prose-invert max-w-none text-sm break-words leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeEmailHtml(selectedMessage.htmlBody, { allowImages }),
                    }}
                  />
                </div>
              ) : (
                <div
                  className="text-sm font-mono whitespace-pre-wrap text-slate-800 dark:text-slate-200 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: linkifyPlainText(selectedMessage.textBody || '(Empty message body)'),
                  }}
                />
              )}
            </div>
          </div>
        ) : (
          /* Email List View */
          <div>
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white text-base">
                  Incoming Messages
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {messages.length}
                </span>
              </div>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                Auto-refreshes in {autoRefreshSeconds}s
              </span>
            </div>

            {messages.length === 0 ? (
              <div className="py-20 text-center px-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 mx-auto flex items-center justify-center mb-4">
                  <RefreshCw className="w-7 h-7 animate-spin opacity-40" />
                </div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-1">
                  Waiting for incoming emails...
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                  Send an email to <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">{mailbox.address}</span>. Messages appear here automatically when received.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Real Ingestion Port & Webhook Active</span>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => handleSelectMessage(msg)}
                    className={`p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                      !msg.isRead
                        ? 'bg-indigo-50/40 dark:bg-indigo-950/20 font-semibold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="shrink-0">
                        {!msg.isRead ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                        ) : (
                          <div className="w-2.5 h-2.5 rounded-full bg-transparent" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                            {msg.from}
                          </span>
                          {msg.otpCode && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 shrink-0">
                              OTP: {msg.otpCode}
                            </span>
                          )}
                          {msg.hasAttachments && (
                            <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                          {msg.subject || '(No Subject)'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-slate-400 font-mono">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCurrentMessage(msg.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                        title="Delete message"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
