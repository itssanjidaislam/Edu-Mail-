import React from 'react';
import { Mail, ShieldCheck, Lock, Globe, Server } from 'lucide-react';
import { ActiveTab } from './Header.tsx';

interface FooterProps {
  setActiveTab: (tab: ActiveTab) => void;
  setLegalSubpage: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab, setLegalSubpage }) => {
  const handleNav = (tab: ActiveTab, subpage?: string) => {
    setActiveTab(tab);
    if (subpage) setLegalSubpage(subpage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-lg tracking-tight">Edu Mail</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Free Temporary Email & Secure Student Utilities. Built on enterprise-grade infrastructure with real-time incoming delivery, automated OTP extraction, and client-side cryptographic security.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-emerald-400">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                Zero-Logs Policy
              </span>
              <span className="inline-flex items-center gap-1">
                <Lock className="w-4 h-4" />
                TLS 1.3 Ingestion
              </span>
            </div>
          </div>

          {/* Quick Tools */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-200 mb-3">
              Platform Tools
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => handleNav('home')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Temporary Mailbox Generator
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('inbox')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Live Web Inbox & OTP Viewer
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('password')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Cryptographic Password Generator
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('handover')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  MX & DNS Records Diagnostic
                </button>
              </li>
            </ul>
          </div>

          {/* Compliance & Legal */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-200 mb-3">
              Compliance & Legal
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => handleNav('legal', 'privacy')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Privacy Policy & Retention
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('legal', 'terms')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('legal', 'aup')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Acceptable Use Policy (AUP)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('legal', 'abuse')}
                  className="text-rose-400 hover:text-rose-300 transition-colors"
                >
                  Report Spam or Abuse
                </button>
              </li>
            </ul>
          </div>

          {/* Engineering & Handover */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-200 mb-3">
              Agency & Infrastructure
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => handleNav('handover')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Agency Handover Specification
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('legal', 'about')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  About Operator Infrastructure
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('legal', 'contact')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  NOC & Security Contact
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('admin')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Operator Admin Console
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="mt-8 pt-8 border-t border-slate-800 text-xs leading-relaxed text-slate-500">
          <p className="mb-2">
            <strong>Legal Notice:</strong> Edu Mail operates exclusively on operator-controlled domain names. Edu Mail is not affiliated with, sponsored by, or endorsing any official university, accredited degree-granting college, or governmental agency. This platform provides temporary inbound mailboxes for spam mitigation, privacy preservation, and software testing. Any misuse for phishing, malware distribution, unauthorized access, fraud, or spam is strictly prohibited and subject to immediate IP blacklisting and legal referral.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/50">
            <span>© {new Date().getFullYear()} Edu Mail. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Server className="w-3.5 h-3.5 text-indigo-400" />
                Inbound Ingestion: Cloudflare & Postfix Active
              </span>
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                RFC 5322 Compliant
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
