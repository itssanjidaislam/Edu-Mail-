import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  RefreshCw,
  Inbox,
  Clock,
  Trash2,
  PlusCircle,
  ShieldCheck,
  Zap,
  Send,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  QrCode,
} from 'lucide-react';
import { Mailbox, DomainConfig } from '../lib/types.ts';
import {
  createTemporaryMailbox,
  deleteMailbox,
  extendMailboxTime,
  DEFAULT_DOMAINS,
  getCustomDomains,
  addUserCustomDomain,
} from '../lib/mailboxService.ts';
import { ActiveTab } from './Header.tsx';

interface HeroGeneratorProps {
  currentMailbox: Mailbox | null;
  setCurrentMailbox: (mailbox: Mailbox | null) => void;
  setActiveTab: (tab: ActiveTab) => void;
  onDispatchTestEmail: (subject: string, text: string, sender: string) => Promise<void>;
}

export const HeroGenerator: React.FC<HeroGeneratorProps> = ({
  currentMailbox,
  setCurrentMailbox,
  setActiveTab,
  onDispatchTestEmail,
}) => {
  const [customDomains, setCustomDomains] = useState<DomainConfig[]>(getCustomDomains());
  const allDomains = [...customDomains, ...DEFAULT_DOMAINS];
  const [selectedDomain, setSelectedDomain] = useState<string>(allDomains[0].id);
  const [customUsernameInput, setCustomUsernameInput] = useState<string>('');
  const [showAddDomainModal, setShowAddDomainModal] = useState<boolean>(false);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [newDomainInput, setNewDomainInput] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('10:00');
  const [isExpired, setIsExpired] = useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [testSender, setTestSender] = useState('accounts@security-verify.org');
  const [testSubject, setTestSubject] = useState('Your Edu Mail Verification Code: 492815');
  const [testBody, setTestBody] = useState(
    'Hello!\n\nYour one-time verification code is 492815.\nThis code will expire in 10 minutes.\n\nBest regards,\nSecurity Operations Team'
  );

  // Expiration countdown
  useEffect(() => {
    if (!currentMailbox || !currentMailbox.expiresAt) return;

    const updateTimer = () => {
      const diff = new Date(currentMailbox.expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('00:00');
        setIsExpired(true);
      } else {
        setIsExpired(false);
        const mins = Math.floor(diff / (60 * 1000));
        const secs = Math.floor((diff % (60 * 1000)) / 1000);
        setTimeLeft(
          `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        );
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [currentMailbox]);

  const handleGenerate = async (domainToUse = selectedDomain) => {
    setLoading(true);
    try {
      const newBox = await createTemporaryMailbox(domainToUse, 10, customUsernameInput);
      setCurrentMailbox(newBox);
      setCustomUsernameInput('');
    } catch (err) {
      console.error('Failed to create mailbox:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!currentMailbox) return;
    navigator.clipboard.writeText(currentMailbox.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExtend = async () => {
    if (!currentMailbox) return;
    try {
      const newExpiry = await extendMailboxTime(currentMailbox.id, 10);
      setCurrentMailbox({
        ...currentMailbox,
        expiresAt: newExpiry,
        status: 'active',
      });
    } catch (err) {
      console.error('Failed to extend time:', err);
    }
  };

  const handleDelete = async () => {
    if (!currentMailbox) return;
    try {
      await deleteMailbox(currentMailbox.id);
      setCurrentMailbox(null);
    } catch (err) {
      console.error('Failed to delete mailbox:', err);
    }
  };

  const handleSendTestMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMailbox) return;
    setTestSending(true);
    try {
      await onDispatchTestEmail(testSubject, testBody, testSender);
      setTestModalOpen(false);
      setActiveTab('inbox');
    } catch (err) {
      console.error('Test dispatch failed:', err);
    } finally {
      setTestSending(false);
    }
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50 dark:from-slate-900/50 dark:via-slate-950 dark:to-slate-900">
      {/* Decorative background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Top Feature Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-6 border border-indigo-200 dark:border-indigo-800">
          <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Real Inbound Infrastructure & Automated OTP Detection</span>
        </div>

        {/* Hero Headlines */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15] mb-4">
          Get a Temporary Email{' '}
          <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-700 dark:from-indigo-400 dark:to-indigo-200 bg-clip-text text-transparent">
            Instantly
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300 mb-10 leading-relaxed">
          Generate a temporary email address and receive incoming messages directly in your private temporary inbox. Fully functional with automated verification code detection.
        </p>

        {/* Main Mailbox Interface Card */}
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 p-6 sm:p-8 backdrop-blur-xl">
          {!currentMailbox ? (
            <div className="space-y-6">
              <div className="space-y-3 text-left">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Custom Mailbox Name (Optional — leave blank for random):
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="flex-1 w-full relative flex items-center bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                    <input
                      type="text"
                      placeholder="e.g. myname or student2026"
                      value={customUsernameInput}
                      onChange={(e) => setCustomUsernameInput(e.target.value)}
                      className="w-full px-4 py-3 bg-transparent text-slate-900 dark:text-white text-sm outline-none"
                    />
                    <span className="px-3 text-slate-400 dark:text-slate-500 font-mono text-sm select-none">
                      @{selectedDomain}
                    </span>
                  </div>

                  {/* Domain Selector */}
                  <div className="w-full sm:w-56 relative flex items-center gap-2">
                    <div className="relative flex-1">
                      <select
                        value={selectedDomain}
                        onChange={(e) => setSelectedDomain(e.target.value)}
                        className="w-full appearance-none bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-4 py-3.5 pr-10 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                      >
                        {allDomains.map((domain) => (
                          <option key={domain.id} value={domain.id}>
                            @{domain.id} {domain.priority === 0 ? '(Private)' : ''}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Want to bypass Facebook/social blocks? Link your own private domain.
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddDomainModal(true)}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+ Add Private Domain</span>
                  </button>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={() => handleGenerate(selectedDomain)}
                disabled={loading}
                className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Zap className="w-5 h-5 fill-white" />
                )}
                <span>Generate Custom Email Address</span>
              </button>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Operator Controlled Domains
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  Cryptographic Randomness
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  10-Minute Auto Purge
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Status and Countdown Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 text-sm">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    {!isExpired && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    )}
                    <span
                      className={`relative inline-flex rounded-full h-3 w-3 ${
                        isExpired ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                    />
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Mailbox Status:
                  </span>
                  <span
                    className={`font-bold ${
                      isExpired
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {isExpired ? 'Expired' : 'Active'}
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-medium">Expires in:</span>
                  <span className="font-mono font-bold text-sm tracking-wider">
                    {timeLeft}
                  </span>
                  <button
                    onClick={handleExtend}
                    className="ml-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                    title="Add 10 more minutes"
                  >
                    +10m
                  </button>
                </div>
              </div>

              {/* Generated Email Address Display */}
              <div className="relative group">
                <div className="w-full bg-slate-50 dark:bg-slate-800/80 border-2 border-indigo-500/30 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-left w-full sm:w-auto overflow-hidden">
                    <span className="text-[11px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block mb-1">
                      Your Temporary Address
                    </span>
                    <span className="font-mono text-lg sm:text-2xl font-black text-slate-900 dark:text-white break-all select-all">
                      {currentMailbox.address}
                    </span>
                  </div>

                  <button
                    onClick={handleCopy}
                    className={`w-full sm:w-auto px-5 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      copied
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20'
                    }`}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setActiveTab('inbox')}
                  className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-sm shadow-md hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Inbox className="w-4 h-4" />
                  <span>Open Inbox</span>
                </button>

                <button
                  onClick={() => handleGenerate(selectedDomain)}
                  disabled={loading}
                  className="px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>New Email</span>
                </button>

                <button
                  onClick={() => setTestModalOpen(true)}
                  className="px-5 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
                  title="Dispatch real test message through parser"
                >
                  <Send className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Send Real Test Email</span>
                </button>

                <button
                  onClick={() => setShowQrModal(true)}
                  className="px-4 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
                  title="Show QR Code for mobile scanning"
                >
                  <QrCode className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>QR Code</span>
                </button>

                <button
                  onClick={handleDelete}
                  className="px-4 py-3 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-medium text-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Terminate mailbox immediately"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Mailbox</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Feature Grid Under Hero */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12 text-left">
          <div className="p-5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 backdrop-blur-sm">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
              Automated OTP Extraction
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Detects 4, 5, 6, and 8-digit verification PINs automatically from incoming mail and provides 1-click clipboard copy.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 backdrop-blur-sm">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
              DOMPurify HTML Sanitization
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Zero-Trust viewer eliminates malicious scripts, tracking pixels, phishing elements, and XSS attacks.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 backdrop-blur-sm">
            <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
              Automatic Data Shredding
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Mailboxes expire in 10 minutes by default. When expired, all messages and mailbox records are immediately purged.
            </p>
          </div>
        </div>
      </div>

      {/* Test Inbound Email Dispatch Modal */}
      {testModalOpen && currentMailbox && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-left">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Send Real Inbound Test Email
                </h3>
              </div>
              <button
                onClick={() => setTestModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 my-4 leading-relaxed">
              This triggers the real inbound email ingestion pipeline. The message will be processed by our RFC parser, OTP detector, and DOMPurify sanitizer, arriving in your active inbox in real time.
            </p>

            <form onSubmit={handleSendTestMessage} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Recipient Address:
                </label>
                <input
                  type="text"
                  disabled
                  value={currentMailbox.address}
                  className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-xs border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sender (From):
                </label>
                <input
                  type="email"
                  required
                  value={testSender}
                  onChange={(e) => setTestSender(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subject Line:
                </label>
                <input
                  type="text"
                  required
                  value={testSubject}
                  onChange={(e) => setTestSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Message Body (with Verification OTP):
                </label>
                <textarea
                  rows={4}
                  required
                  value={testBody}
                  onChange={(e) => setTestBody(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setTestModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={testSending}
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {testSending ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Ingest Test Message</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Private Custom Domain Modal (Anti-Block Shield) */}
      {showAddDomainModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Add Private Custom Domain
                </h3>
              </div>
              <button
                onClick={() => setShowAddDomainModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Connect your own private custom domain (e.g., <code className="text-indigo-500 font-mono">mymail.online</code>) to bypass Facebook, Instagram, and social media disposable email blocks.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newDomainInput.trim()) return;
                const updated = addUserCustomDomain(newDomainInput.trim());
                setCustomDomains(updated);
                setSelectedDomain(newDomainInput.toLowerCase().trim().replace(/[^a-z0-9.-]/g, ''));
                setNewDomainInput('');
                setShowAddDomainModal(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Your Domain Name:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. mymail.online or mail.mysite.com"
                  value={newDomainInput}
                  onChange={(e) => setNewDomainInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 text-[11px] text-indigo-800 dark:text-indigo-300 space-y-1">
                <p className="font-bold">Required DNS Setup:</p>
                <p>Point MX records to your inbound server and configure SPF/DKIM to route messages instantly.</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDomainModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md cursor-pointer"
                >
                  Save & Use Domain
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQrModal && currentMailbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Email QR Code
                </h3>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 dark:border-slate-800 inline-block shadow-inner mx-auto">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(currentMailbox.address)}`}
                alt="Email QR Code"
                className="w-44 h-44 mx-auto rounded-lg"
              />
            </div>

            <p className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 break-all select-all bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">
              {currentMailbox.address}
            </p>

            <p className="text-[11px] text-slate-500">
              Scan with your mobile camera to quickly copy or open this address.
            </p>

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
