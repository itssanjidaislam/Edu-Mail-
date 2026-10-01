import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Sliders,
  Lock,
  Layers,
} from 'lucide-react';
import { PasswordOptions } from '../lib/types.ts';
import {
  generateSecurePasswords,
  GeneratedPassword,
} from '../lib/passwordGenerator.ts';

export const PasswordGenerator: React.FC = () => {
  const [options, setOptions] = useState<PasswordOptions>({
    length: 18,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: false,
    count: 1,
  });

  const [passwords, setPasswords] = useState<GeneratedPassword[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Generate on initial render and when options change
  useEffect(() => {
    handleRegenerate();
  }, [options]);

  const handleRegenerate = () => {
    const list = generateSecurePasswords(options);
    setPasswords(list);
  };

  const handleCopy = (value: string, index: number) => {
    navigator.clipboard.writeText(value);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const primaryPassword = passwords[0];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-semibold mb-3 border border-amber-200 dark:border-amber-800">
          <Lock className="w-3.5 h-3.5" />
          <span>Client-Side Web Crypto (Zero-Knowledge)</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Secure Password Generator
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl mx-auto mt-2 leading-relaxed">
          Generate cryptographically strong passwords directly in your browser using hardware-backed entropy. Passwords are never sent to any server, stored, or logged.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
        {/* Primary Password Display Banner */}
        {primaryPassword && (
          <div className="space-y-3">
            <div className="relative group">
              <div className="bg-slate-50 dark:bg-slate-800 border-2 border-indigo-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="font-mono text-xl sm:text-2xl font-bold tracking-wider text-slate-900 dark:text-white break-all select-all text-left w-full sm:w-auto">
                  {primaryPassword.value}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={handleRegenerate}
                    className="p-3 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                    title="Generate new password"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => handleCopy(primaryPassword.value, 0)}
                    className={`px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 cursor-pointer transition-all ${
                      copiedIndex === 0
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/25'
                    }`}
                  >
                    {copiedIndex === 0 ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedIndex === 0 ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Strength Meter Bar */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="font-semibold text-slate-500 dark:text-slate-400">Strength:</span>
                <span
                  className={`font-black uppercase tracking-wider ${
                    primaryPassword.strengthScore >= 80
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : primaryPassword.strengthScore >= 60
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : primaryPassword.strengthScore >= 40
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {primaryPassword.strengthLabel} ({primaryPassword.entropy} bits entropy)
                </span>
              </div>

              <div className="w-full sm:w-48 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    primaryPassword.strengthScore >= 80
                      ? 'bg-emerald-500'
                      : primaryPassword.strengthScore >= 60
                      ? 'bg-indigo-500'
                      : primaryPassword.strengthScore >= 40
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${primaryPassword.strengthScore}%` }}
                />
              </div>

              <div className="text-slate-500 dark:text-slate-400 text-right w-full sm:w-auto">
                Crack Estimate: <strong className="text-slate-700 dark:text-slate-200">{primaryPassword.crackTimeEstimate}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Controls Grid */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-6">
          {/* Length Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-500" />
                Password Length:
              </span>
              <span className="font-mono font-black text-lg text-indigo-600 dark:text-indigo-400 px-3 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950">
                {options.length}
              </span>
            </div>
            <input
              type="range"
              min="8"
              max="128"
              value={options.length}
              onChange={(e) =>
                setOptions({ ...options, length: parseInt(e.target.value, 10) })
              }
              className="w-full accent-indigo-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>8 chars</span>
              <span>16 (standard)</span>
              <span>32 (strong)</span>
              <span>64 (extreme)</span>
              <span>128 (max)</span>
            </div>
          </div>

          {/* Character Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
              <input
                type="checkbox"
                checked={options.uppercase}
                onChange={(e) => setOptions({ ...options, uppercase: e.target.checked })}
                className="w-4 h-4 accent-indigo-600 rounded"
              />
              <span className="font-medium text-slate-800 dark:text-slate-200">Uppercase Letters (A-Z)</span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
              <input
                type="checkbox"
                checked={options.lowercase}
                onChange={(e) => setOptions({ ...options, lowercase: e.target.checked })}
                className="w-4 h-4 accent-indigo-600 rounded"
              />
              <span className="font-medium text-slate-800 dark:text-slate-200">Lowercase Letters (a-z)</span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
              <input
                type="checkbox"
                checked={options.numbers}
                onChange={(e) => setOptions({ ...options, numbers: e.target.checked })}
                className="w-4 h-4 accent-indigo-600 rounded"
              />
              <span className="font-medium text-slate-800 dark:text-slate-200">Numbers (0-9)</span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
              <input
                type="checkbox"
                checked={options.symbols}
                onChange={(e) => setOptions({ ...options, symbols: e.target.checked })}
                className="w-4 h-4 accent-indigo-600 rounded"
              />
              <span className="font-medium text-slate-800 dark:text-slate-200">Special Symbols (!@#$%)</span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer sm:col-span-2">
              <input
                type="checkbox"
                checked={options.excludeAmbiguous}
                onChange={(e) =>
                  setOptions({ ...options, excludeAmbiguous: e.target.checked })
                }
                className="w-4 h-4 accent-indigo-600 rounded"
              />
              <div>
                <span className="font-medium text-slate-800 dark:text-slate-200 block">
                  Exclude Ambiguous Characters
                </span>
                <span className="text-xs text-slate-400">
                  Omits characters like 1, l, I, 0, O, o that look identical in some fonts.
                </span>
              </div>
            </label>
          </div>

          {/* Multiple Password Generator Count */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Generate in Bulk:
              </span>
              {[1, 3, 5, 10].map((num) => (
                <button
                  key={num}
                  onClick={() => setOptions({ ...options, count: num })}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    options.count === num
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {num}x
                </button>
              ))}
            </div>

            <button
              onClick={handleRegenerate}
              className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs flex items-center gap-2 hover:opacity-90 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate All</span>
            </button>
          </div>

          {/* Multi-Password Output List (if count > 1) */}
          {passwords.length > 1 && (
            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Generated Batch ({passwords.length})
              </h4>
              {passwords.map((pwd, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs"
                >
                  <span className="font-mono text-slate-800 dark:text-slate-200 break-all">
                    {pwd.value}
                  </span>
                  <button
                    onClick={() => handleCopy(pwd.value, idx)}
                    className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors cursor-pointer"
                    title="Copy password"
                  >
                    {copiedIndex === idx ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Security Disclaimers Box */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>
            Zero-Knowledge Assurance: Passwords are generated exclusively via standard Web Cryptography API in your local memory. Never sent over the network or saved anywhere.
          </span>
        </div>
      </div>
    </div>
  );
};
