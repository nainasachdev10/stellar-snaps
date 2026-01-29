/**
 * URL Resolution Utilities
 *
 * Handles shortened URL detection and resolution for snap links.
 */

/** List of known URL shortener domains */
export const SHORTENER_DOMAINS = [
  't.co',
  'bit.ly',
  'goo.gl',
  'tinyurl.com',
  'ow.ly',
  'is.gd',
  'buff.ly',
  'adf.ly',
  'bit.do',
  'mcaf.ee',
  'su.pr',
  'twit.ac',
  'tiny.cc',
  'lnkd.in',
  'db.tt',
  'qr.ae',
  'cur.lv',
  'ity.im',
  'q.gs',
  'po.st',
  'bc.vc',
  'u.to',
  'j.mp',
  'buzurl.com',
  'cutt.us',
  'u.bb',
  'yourls.org',
  'x.co',
  'prettylinkpro.com',
  'viralurl.com',
  'twitthis.com',
  'shorturl.at',
  'rb.gy',
  'shorturl.com',
] as const;

export interface ResolvedUrl {
  /** The final resolved URL after following redirects */
  url: string;
  /** The domain of the resolved URL */
  domain: string;
  /** The original URL before resolution */
  originalUrl: string;
  /** Whether the URL was shortened */
  wasShortened: boolean;
}

/**
 * Checks if a URL is from a known URL shortener.
 *
 * @example
 * ```typescript
 * isShortenerUrl('https://t.co/abc123'); // true
 * isShortenerUrl('https://stellarsnaps.com/s/abc'); // false
 * ```
 */
export function isShortenerUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const domain = parsed.hostname.toLowerCase();
    return SHORTENER_DOMAINS.some(
      (shortener) => domain === shortener || domain.endsWith(`.${shortener}`)
    );
  } catch {
    return false;
  }
}

/**
 * Extracts the domain from a URL.
 *
 * @example
 * ```typescript
 * extractDomain('https://stellarsnaps.com/s/abc123'); // 'stellarsnaps.com'
 * ```
 */
export function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.toLowerCase();
  } catch {
    return '';
  }
}

/**
 * Extracts the path from a URL.
 *
 * @example
 * ```typescript
 * extractPath('https://stellarsnaps.com/s/abc123'); // '/s/abc123'
 * ```
 */
export function extractPath(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.pathname;
  } catch {
    return '';
  }
}

/**
 * Resolves a shortened URL by following redirects.
 * This is a server-side function that requires fetch with redirect following.
 *
 * @example
 * ```typescript
 * const resolved = await resolveUrl('https://t.co/abc123');
 * console.log(resolved.url); // 'https://stellarsnaps.com/s/xyz789'
 * ```
 */
export async function resolveUrl(url: string): Promise<ResolvedUrl> {
  const originalUrl = url;
  const wasShortened = isShortenerUrl(url);

  if (!wasShortened) {
    return {
      url,
      domain: extractDomain(url),
      originalUrl,
      wasShortened: false,
    };
  }

  try {
    // Follow redirects with HEAD request (lighter than GET)
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
    });

    const finalUrl = response.url;

    return {
      url: finalUrl,
      domain: extractDomain(finalUrl),
      originalUrl,
      wasShortened: true,
    };
  } catch (error) {
    // If resolution fails, return original URL
    return {
      url,
      domain: extractDomain(url),
      originalUrl,
      wasShortened: true,
    };
  }
}

/**
 * Batch resolve multiple URLs.
 *
 * @example
 * ```typescript
 * const urls = ['https://t.co/a', 'https://bit.ly/b'];
 * const resolved = await resolveUrls(urls);
 * ```
 */
export async function resolveUrls(urls: string[]): Promise<ResolvedUrl[]> {
  return Promise.all(urls.map(resolveUrl));
}
