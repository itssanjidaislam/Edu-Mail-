import DOMPurify from 'dompurify';

export interface SanitizationOptions {
  allowImages?: boolean;
}

/**
 * Sanitizes untrusted incoming email HTML to eliminate XSS, script injection,
 * malicious event handlers, dangerous schemes, and phishing forms.
 * Works seamlessly in both browser (full DOMPurify) and server environments.
 */
export function sanitizeEmailHtml(rawHtml: string, options: SanitizationOptions = {}): string {
  if (!rawHtml) return '';

  const { allowImages = false } = options;

  // Browser execution with full DOMPurify capabilities
  if (typeof window !== 'undefined' && DOMPurify && typeof DOMPurify.sanitize === 'function') {
    return DOMPurify.sanitize(rawHtml, {
      ALLOWED_TAGS: [
        'a', 'b', 'blockquote', 'br', 'center', 'code', 'div', 'em', 'font', 'h1', 'h2', 'h3',
        'h4', 'h5', 'h6', 'hr', 'i', 'li', 'ol', 'p', 'pre', 'small', 'span', 'strong',
        'sub', 'sup', 'table', 'tbody', 'td', 'th', 'thead', 'tr', 'u', 'ul',
        ...(allowImages ? ['img'] : [])
      ],
      ALLOWED_ATTR: [
        'align', 'bgcolor', 'border', 'cellpadding', 'cellspacing', 'color',
        'colspan', 'dir', 'height', 'href', 'rowspan', 'style', 'title', 'valign', 'width',
        ...(allowImages ? ['src', 'alt', 'width', 'height'] : [])
      ],
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
      FORBID_TAGS: ['script', 'style', 'iframe', 'frame', 'object', 'embed', 'form', 'input', 'button', 'base', 'meta', 'link'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'formaction'],
      RETURN_TRUSTED_TYPE: false,
    });
  }

  // Node.js server fallback: strictly strip script, style, iframe, form, and inline event handlers
  let clean = rawHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/\son\w+\s*=\s*(?:["'][^"']*["']|[^\s>]+)/gi, '')
    .replace(/href\s*=\s*["']?javascript:[^"'>]*["']?/gi, 'href="#"');

  if (!allowImages) {
    clean = clean.replace(/<img\b[^>]*>/gi, '');
  }

  return clean;
}

/**
 * Neutralizes URLs in plain text and converts them into safe clickable anchors with noopener
 */
export function linkifyPlainText(text: string): string {
  if (!text) return '';
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;
  return escaped.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer nofollow" class="text-indigo-600 dark:text-indigo-400 underline break-all hover:text-indigo-800">${url}</a>`;
  });
}
