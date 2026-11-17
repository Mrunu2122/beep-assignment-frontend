import sanitizeHtml from 'sanitize-html';
import { decode } from 'html-entities';

/**
 * Normalizes and decodes an HTML or plain-text job description safely.
 * Handles idempotent multi-pass entity decoding (such as &amp;lt; or single &lt;).
 */
export function decodeHtmlEntities(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';

  let current = raw;
  // Decode up to 3 passes to handle single and double encoded entities while preventing infinite loops
  for (let i = 0; i < 3; i++) {
    const decoded = decode(current);
    if (decoded === current) break;
    current = decoded;
  }
  return current;
}

/**
 * Removes noisy internal wrapper classes or Slack-kit container artifacts
 * while preserving the semantic content inside.
 */
export function stripWrapperNoise(html: string): string {
  if (!html) return '';
  return html
    .replace(/class="c-message_kit[^"]*"/gi, '')
    .replace(/class="c-message[^"]*"/gi, '')
    .replace(/class="p-block_kit[^"]*"/gi, '')
    .replace(/data-qa="[^"]*"/gi, '');
}

/**
 * Sanitizes an HTML string using sanitize-html with an explicit whitelist.
 * Pure CJS/ESM universal library that has ZERO DOM/JSDOM/ESM-incompatibility issues.
 * Strips script tags, style tags, object/embed/iframe tags, and all inline event handlers.
 * Transforms all valid anchor links to open in a new tab with rel="noopener noreferrer".
 */
export function sanitizeJobDescription(content: string): string {
  if (!content || typeof content !== 'string') return '';

  // 1. Decode entities
  const decoded = decodeHtmlEntities(content);

  // 2. Clean noisy wrapper attributes
  const cleaned = stripWrapperNoise(decoded);

  // 3. Strict sanitize-html configuration
  const sanitized = sanitizeHtml(cleaned, {
    allowedTags: [
      'p', 'br', 'b', 'i', 'em', 'strong', 'a',
      'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'code', 'pre', 'hr',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span'
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel', 'title'],
      div: ['class'],
      span: ['class'],
      p: ['class'],
      h1: ['class'],
      h2: ['class'],
      h3: ['class'],
      h4: ['class'],
      li: ['class']
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: (tagName, attribs) => {
        return {
          tagName: 'a',
          attribs: {
            ...attribs,
            target: '_blank',
            rel: 'noopener noreferrer'
          }
        };
      }
    }
  });

  return sanitized;
}
