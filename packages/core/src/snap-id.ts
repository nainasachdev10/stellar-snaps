/**
 * Snap ID Generation
 *
 * Generates unique, URL-safe IDs for snaps.
 */

/** Characters used for ID generation (URL-safe) */
const ALPHABET =
  'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';

/**
 * Generates a random snap ID.
 *
 * Uses a URL-safe alphabet similar to nanoid.
 * Default length is 8 characters (similar to YouTube video IDs).
 *
 * @example
 * ```typescript
 * const id = generateSnapId(); // 'nk1VNcxo'
 * const longId = generateSnapId(12); // 'nk1VNcxo4Abc'
 * ```
 */
export function generateSnapId(length: number = 8): string {
  let id = '';
  const randomValues = new Uint8Array(length);

  // Use crypto.getRandomValues if available (browser/Node 15+)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomValues);
  } else {
    // Fallback for older environments
    for (let i = 0; i < length; i++) {
      randomValues[i] = Math.floor(Math.random() * 256);
    }
  }

  for (let i = 0; i < length; i++) {
    id += ALPHABET[randomValues[i]! % ALPHABET.length];
  }

  return id;
}

/**
 * Validates a snap ID format.
 *
 * @example
 * ```typescript
 * isValidSnapId('nk1VNcxo'); // true
 * isValidSnapId(''); // false
 * isValidSnapId('has spaces'); // false
 * ```
 */
export function isValidSnapId(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  if (id.length < 4 || id.length > 32) return false;

  // Only allow URL-safe characters
  return /^[a-zA-Z0-9_-]+$/.test(id);
}

/**
 * Extracts a snap ID from a URL.
 *
 * @example
 * ```typescript
 * extractSnapId('https://stellarsnaps.com/s/nk1VNcxo'); // 'nk1VNcxo'
 * extractSnapId('https://example.com/pay/abc123'); // 'abc123'
 * ```
 */
export function extractSnapId(
  url: string,
  patterns: string[] = ['/s/', '/snap/', '/pay/']
): string | null {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname;

    for (const pattern of patterns) {
      const index = path.indexOf(pattern);
      if (index !== -1) {
        const idStart = index + pattern.length;
        const remaining = path.slice(idStart);
        // Extract ID (stop at next slash or end)
        const match = remaining.match(/^([a-zA-Z0-9_-]+)/);
        if (match && isValidSnapId(match[1]!)) {
          return match[1]!;
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}
