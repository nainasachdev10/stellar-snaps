/**
 * Meta Tag Generation
 *
 * Generate OpenGraph and Twitter meta tags for snap pages.
 */

export interface SnapMetadata {
  /** Snap title */
  title: string;
  /** Snap description */
  description?: string;
  /** Image URL */
  imageUrl?: string;
  /** Payment amount */
  amount?: string;
  /** Asset code */
  assetCode?: string;
  /** Full snap URL */
  url: string;
  /** Site name */
  siteName?: string;
}

export interface MetaTags {
  /** OpenGraph tags */
  og: Record<string, string>;
  /** Twitter card tags */
  twitter: Record<string, string>;
  /** Standard meta tags */
  standard: Record<string, string>;
}

/**
 * Generates meta tags for a snap page.
 *
 * @example
 * ```typescript
 * const tags = generateMetaTags({
 *   title: 'Pay for Coffee',
 *   description: 'Send 5 XLM for coffee',
 *   amount: '5',
 *   assetCode: 'XLM',
 *   url: 'https://stellarsnaps.com/s/abc123',
 * });
 *
 * // Use in Next.js metadata:
 * export const metadata = {
 *   title: tags.standard.title,
 *   openGraph: tags.og,
 *   twitter: tags.twitter,
 * };
 * ```
 */
export function generateMetaTags(metadata: SnapMetadata): MetaTags {
  const {
    title,
    description,
    imageUrl,
    amount,
    assetCode = 'XLM',
    url,
    siteName = 'Stellar Snaps',
  } = metadata;

  // Build description if not provided
  const autoDescription =
    description ||
    (amount
      ? `Pay ${amount} ${assetCode} - ${title}`
      : `Make a payment - ${title}`);

  return {
    og: {
      'og:title': title,
      'og:description': autoDescription,
      'og:url': url,
      'og:site_name': siteName,
      'og:type': 'website',
      ...(imageUrl && { 'og:image': imageUrl }),
    },
    twitter: {
      'twitter:card': imageUrl ? 'summary_large_image' : 'summary',
      'twitter:title': title,
      'twitter:description': autoDescription,
      ...(imageUrl && { 'twitter:image': imageUrl }),
    },
    standard: {
      title: `${title} | ${siteName}`,
      description: autoDescription,
    },
  };
}

/**
 * Converts meta tags to HTML string.
 *
 * @example
 * ```typescript
 * const html = metaTagsToHtml(tags);
 * // <meta property="og:title" content="Pay for Coffee" />
 * // <meta property="og:description" content="..." />
 * // ...
 * ```
 */
export function metaTagsToHtml(tags: MetaTags): string {
  const lines: string[] = [];

  // Standard tags
  if (tags.standard.title) {
    lines.push(`<title>${escapeHtml(tags.standard.title)}</title>`);
  }
  if (tags.standard.description) {
    lines.push(
      `<meta name="description" content="${escapeHtml(tags.standard.description)}" />`
    );
  }

  // OpenGraph tags
  for (const [property, content] of Object.entries(tags.og)) {
    lines.push(
      `<meta property="${escapeHtml(property)}" content="${escapeHtml(content)}" />`
    );
  }

  // Twitter tags
  for (const [name, content] of Object.entries(tags.twitter)) {
    lines.push(
      `<meta name="${escapeHtml(name)}" content="${escapeHtml(content)}" />`
    );
  }

  return lines.join('\n');
}

/**
 * Escapes HTML special characters.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Generates JSON-LD structured data for a snap.
 *
 * @example
 * ```typescript
 * const jsonLd = generateJsonLd({
 *   title: 'Pay for Coffee',
 *   amount: '5',
 *   assetCode: 'XLM',
 *   url: 'https://stellarsnaps.com/s/abc123',
 * });
 * ```
 */
export function generateJsonLd(metadata: SnapMetadata): object {
  const { title, description, amount, assetCode = 'XLM', url, imageUrl } = metadata;

  return {
    '@context': 'https://schema.org',
    '@type': 'PaymentService',
    name: title,
    description: description || `Pay ${amount || 'any amount'} ${assetCode}`,
    url,
    ...(imageUrl && { image: imageUrl }),
    ...(amount && {
      offers: {
        '@type': 'Offer',
        price: amount,
        priceCurrency: assetCode,
      },
    }),
  };
}
