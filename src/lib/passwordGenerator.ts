import { PasswordOptions } from './types.ts';

const UPPERCASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE_CHARS = 'abcdefghijklmnopqrstuvwxyz';
const NUMBER_CHARS = '0123456789';
const SYMBOL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

// Ambiguous characters: 1, l, I, 0, O, o, `, ~, ;, :, ', ", ,
const AMBIGUOUS_REGEX = /[1lI0Oo`~;:,'"]/g;

export interface GeneratedPassword {
  value: string;
  entropy: number;
  strengthScore: number; // 0 - 100
  strengthLabel: 'Very Weak' | 'Weak' | 'Medium' | 'Strong' | 'Unbreakable';
  crackTimeEstimate: string;
}

export function generateSecurePasswords(options: PasswordOptions): GeneratedPassword[] {
  let pool = '';

  if (options.uppercase) pool += UPPERCASE_CHARS;
  if (options.lowercase) pool += LOWERCASE_CHARS;
  if (options.numbers) pool += NUMBER_CHARS;
  if (options.symbols) pool += SYMBOL_CHARS;

  if (options.excludeAmbiguous) {
    pool = pool.replace(AMBIGUOUS_REGEX, '');
  }

  // Fallback if user unchecks everything
  if (!pool) {
    pool = LOWERCASE_CHARS + NUMBER_CHARS;
  }

  const results: GeneratedPassword[] = [];
  const count = Math.max(1, Math.min(20, options.count || 1));
  const length = Math.max(8, Math.min(128, options.length || 16));

  for (let c = 0; c < count; c++) {
    const randomBytes = new Uint32Array(length);
    window.crypto.getRandomValues(randomBytes);

    let password = '';
    for (let i = 0; i < length; i++) {
      password += pool[randomBytes[i] % pool.length];
    }

    // Calculate information entropy: E = L * log2(pool.length)
    const poolSize = pool.length;
    const entropy = Math.round(length * (Math.log(poolSize) / Math.log(2)));

    // Strength evaluation
    let strengthScore = 0;
    let strengthLabel: GeneratedPassword['strengthLabel'] = 'Weak';
    let crackTimeEstimate = 'Few seconds';

    if (entropy < 36) {
      strengthScore = 20;
      strengthLabel = 'Very Weak';
      crackTimeEstimate = '< 1 millisecond';
    } else if (entropy < 60) {
      strengthScore = 45;
      strengthLabel = 'Weak';
      crackTimeEstimate = 'A few minutes to hours';
    } else if (entropy < 80) {
      strengthScore = 75;
      strengthLabel = 'Medium';
      crackTimeEstimate = 'A few centuries';
    } else if (entropy < 100) {
      strengthScore = 90;
      strengthLabel = 'Strong';
      crackTimeEstimate = 'Millions of years';
    } else {
      strengthScore = 100;
      strengthLabel = 'Unbreakable';
      crackTimeEstimate = 'Billions of years (Quantum-resistant)';
    }

    results.push({
      value: password,
      entropy,
      strengthScore,
      strengthLabel,
      crackTimeEstimate,
    });
  }

  return results;
}
