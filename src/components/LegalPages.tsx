import React, { useState } from 'react';
import {
  ShieldAlert,
  FileText,
  Lock,
  Mail,
  CheckCircle,
  AlertTriangle,
  Send,
  Building,
  Scale,
  RefreshCw,
} from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import { AbuseReport } from '../lib/types.ts';

interface LegalPagesProps {
  initialSubpage?: string;
}

export const LegalPages: React.FC<LegalPagesProps> = ({ initialSubpage = 'privacy' }) => {
  const [currentSubpage, setCurrentSubpage] = useState<string>(initialSubpage);

  // Abuse Report Form State
  const [targetAddress, setTargetAddress] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [reason, setReason] = useState<AbuseReport['reason']>('spam');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);

  const handleSubmitAbuse = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const payload: AbuseReport = {
        id: reportId,
        targetAddress: targetAddress.trim(),
        reporterEmail: reporterEmail.trim() || undefined,
        reason,
        details: details.trim(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'abuse_reports'), payload);
      setSubmittedTicketId(reportId);
      setTargetAddress('');
      setReporterEmail('');
      setDetails('');
    } catch (err) {
      console.error('Failed to submit abuse report:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Subpage Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
        <button
          onClick={() => setCurrentSubpage('privacy')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            currentSubpage === 'privacy'
              ? 'bg-indigo-600 text-white'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          Privacy Policy
        </button>

        <button
          onClick={() => setCurrentSubpage('terms')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            currentSubpage === 'terms'
              ? 'bg-indigo-600 text-white'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          Terms of Service
        </button>

        <button
          onClick={() => setCurrentSubpage('aup')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            currentSubpage === 'aup'
              ? 'bg-indigo-600 text-white'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          Acceptable Use (AUP)
        </button>

        <button
          onClick={() => setCurrentSubpage('abuse')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            currentSubpage === 'abuse'
              ? 'bg-rose-600 text-white'
              : 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
          }`}
        >
          Report Abuse
        </button>

        <button
          onClick={() => setCurrentSubpage('about')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            currentSubpage === 'about'
              ? 'bg-indigo-600 text-white'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          About Edu Mail
        </button>

        <button
          onClick={() => setCurrentSubpage('contact')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            currentSubpage === 'contact'
              ? 'bg-indigo-600 text-white'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          Contact NOC
        </button>
      </div>

      {/* 1. Privacy Policy */}
      {currentSubpage === 'privacy' && (
        <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-5 h-5 text-indigo-500" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Privacy Policy</h2>
          </div>
          <p className="text-xs text-slate-400">Effective Date: October 2026</p>

          <h3 className="font-bold text-base text-slate-900 dark:text-white pt-2">1. Temporary Mailbox Lifecycle</h3>
          <p>
            Edu Mail provides temporary disposable mailboxes designed to shield your permanent email address from marketing lists, spam, and unsolicited communications. Each mailbox has a default active lifespan of 10 minutes.
          </p>

          <h3 className="font-bold text-base text-slate-900 dark:text-white pt-2">2. Data Shredding & Zero Permanent Retention</h3>
          <p>
            When a mailbox expires or is manually deleted by the user, all associated message records, headers, text, and sanitized HTML bodies are automatically purged from our database storage. We maintain zero long-term archives of email contents.
          </p>

          <h3 className="font-bold text-base text-slate-900 dark:text-white pt-2">3. Zero-Knowledge Password Generator</h3>
          <p>
            Our standalone Password Generator operates exclusively within your client web browser using the standard Web Cryptography API (<code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-500">window.crypto.getRandomValues</code>). Generated passwords are never transmitted over the internet, never sent to server analytics, and never recorded.
          </p>

          <h3 className="font-bold text-base text-slate-900 dark:text-white pt-2">4. Privacy Logging & Anonymity</h3>
          <p>
            We do not sell user data. To protect our network against distributed abuse, denial-of-wallet, and phishing campaigns, transient IP request rates and system errors are monitored. We do not falsely claim "100% untraceable anonymity" as all systems operate within applicable telecommunications and cybersecurity legal boundaries.
          </p>
        </article>
      )}

      {/* 2. Terms of Service */}
      {currentSubpage === 'terms' && (
        <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2 mb-2">
            <Scale className="w-5 h-5 text-indigo-500" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Terms of Service</h2>
          </div>

          <p>
            By accessing or using Edu Mail, you agree to be bound by these Terms of Service. If you disagree with any portion of these terms, you must discontinue using our services immediately.
          </p>

          <h3 className="font-bold text-base text-slate-900 dark:text-white pt-2">1. Nature of Service</h3>
          <p>
            Edu Mail provides ephemeral inbound mailbox endpoints on operator-controlled domain names. The service is provided strictly "as-is" and "as available". We do not guarantee permanent delivery, availability, or compatibility with any specific third-party provider.
          </p>

          <h3 className="font-bold text-base text-slate-900 dark:text-white pt-2">2. Third-Party Acceptance</h3>
          <p>
            Third-party online platforms (such as Google, Apple, Microsoft, social networks, and SaaS providers) maintain their own independent anti-abuse and disposable email blocklists. We make zero representation or guarantee that third-party services will accept disposable domain addresses.
          </p>

          <h3 className="font-bold text-base text-slate-900 dark:text-white pt-2">3. Termination of Access</h3>
          <p>
            We reserve the absolute right to terminate mailboxes, block IP ranges, or disable domain routes without prior notice in the event of detected malicious activity, illegal conduct, or violations of our Acceptable Use Policy.
          </p>
        </article>
      )}

      {/* 3. Acceptable Use Policy */}
      {currentSubpage === 'aup' && (
        <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Acceptable Use Policy (AUP)</h2>
          </div>

          <p className="text-rose-600 dark:text-rose-400 font-semibold">
            Edu Mail enforces a strict Zero-Tolerance policy against abuse, fraud, and illicit network activity.
          </p>

          <h3 className="font-bold text-base text-slate-900 dark:text-white pt-2">Strictly Prohibited Activities:</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Automated Account Farming:</strong> Creating scripts or bots to mass-register fraudulent accounts across external services.</li>
            <li><strong>Phishing & Social Engineering:</strong> Impersonating corporate, governmental, educational, or financial institutions.</li>
            <li><strong>Malware & Ransomware Distribution:</strong> Utilizing mailboxes to orchestrate, receive telemetry from, or command malicious software.</li>
            <li><strong>Spamming & Mail Bombing:</strong> Flooding mail exchangers or conducting unsolicited bulk messaging campaigns.</li>
            <li><strong>Identity Theft & Financial Fraud:</strong> Unauthorized interception, payment bypass, or stolen credential testing.</li>
          </ul>

          <h3 className="font-bold text-base text-slate-900 dark:text-white pt-2">Enforcement & Legal Compliance</h3>
          <p>
            Violations will result in instantaneous IP bans, domain blacklisting, and cooperation with upstream transit providers and legal authorities where required by subpoena or court order.
          </p>
        </article>
      )}

      {/* 4. Report Abuse Portal */}
      {currentSubpage === 'abuse' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Report Spam or Abuse</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Submit an urgent abuse ticket to our Network Operations Center (NOC). We investigate all reports within 24 hours.
            </p>
          </div>

          {submittedTicketId ? (
            <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-center space-y-3">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Abuse Ticket Submitted Successfully
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                Your report reference ID is <code className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{submittedTicketId}</code>. Our compliance engineering team will inspect the target mailbox and enforce necessary domain-level blocks.
              </p>
              <button
                onClick={() => setSubmittedTicketId(null)}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs cursor-pointer hover:bg-emerald-700"
              >
                Submit Another Report
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitAbuse} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reported Edu Mail Address or Domain: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. user_x982@edumail.dev"
                  value={targetAddress}
                  onChange={(e) => setTargetAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Violation Category: *
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as AbuseReport['reason'])}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-rose-500 outline-none cursor-pointer"
                >
                  <option value="spam">Unsolicited Bulk Spam</option>
                  <option value="phishing">Phishing / Credential Harvesting</option>
                  <option value="harassment">Harassment or Abuse</option>
                  <option value="fraud">Fraud / Financial Scam</option>
                  <option value="other">Other Terms Violation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Your Contact Email (for ticket follow-up):
                </label>
                <input
                  type="email"
                  placeholder="reporter@yourorganization.com"
                  value={reporterEmail}
                  onChange={(e) => setReporterEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Evidence & Detailed Description: *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Include headers, timestamp, and context of the violation..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {submitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Submit Abuse Report</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* 5. About Edu Mail */}
      {currentSubpage === 'about' && (
        <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2 mb-2">
            <Building className="w-5 h-5 text-indigo-500" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">About Edu Mail</h2>
          </div>

          <p>
            Edu Mail is an independent utility and privacy platform engineered for students, developers, QA testers, and privacy-conscious internet users.
          </p>

          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 text-xs">
            <strong>Institutional Non-Affiliation Statement:</strong> Edu Mail operates exclusively on operator-registered domains. The platform does not claim, imply, or impersonate accredited universities, colleges, higher education degree-granting bodies, or governmental institutions. It is a technical utility designed to safely handle transient account verification and software testing.
          </div>

          <h3 className="font-bold text-base text-slate-900 dark:text-white pt-2">Our Engineering Values:</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Zero Fake Functionality:</strong> Real RFC 5322 parsing, real MX routing, and genuine client-side cryptographic security.</li>
            <li><strong>Absolute Respect for Privacy:</strong> We do not monetarily sell personal telemetry or profile user identities.</li>
            <li><strong>Open Infrastructure Standards:</strong> Built with standard protocols compatible with Cloudflare Workers, Haraka, Postfix, and modern cloud platforms.</li>
          </ul>
        </article>
      )}

      {/* 6. Contact NOC */}
      {currentSubpage === 'contact' && (
        <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-5 h-5 text-indigo-500" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Contact & Network Operations</h2>
          </div>

          <p>
            For upstream ISP inquiries, peering, domain ownership verification, or security advisories, please reach out to our engineering desks:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-xs uppercase font-bold text-slate-400 block mb-1">Abuse & Security Inquiries</span>
              <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">abuse@edumail.dev</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-xs uppercase font-bold text-slate-400 block mb-1">NOC / Technical Engineering</span>
              <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">noc@edumail.dev</span>
            </div>
          </div>
        </article>
      )}
    </div>
  );
};
