import { describe, it, expect } from 'vitest';
import { generateMetaTags, metaTagsToHtml, generateJsonLd } from '../meta-tags';

describe('generateMetaTags', () => {
  it('should generate basic meta tags', () => {
    const tags = generateMetaTags({
      title: 'Pay for Coffee',
      url: 'https://example.com/s/abc',
    });

    expect(tags.og['og:title']).toBe('Pay for Coffee');
    expect(tags.og['og:url']).toBe('https://example.com/s/abc');
    expect(tags.twitter['twitter:title']).toBe('Pay for Coffee');
  });

  it('should generate auto description with amount', () => {
    const tags = generateMetaTags({
      title: 'Coffee',
      amount: '5',
      assetCode: 'XLM',
      url: 'https://example.com/s/abc',
    });

    expect(tags.og['og:description']).toBe('Pay 5 XLM - Coffee');
  });

  it('should use provided description', () => {
    const tags = generateMetaTags({
      title: 'Coffee',
      description: 'Custom description',
      url: 'https://example.com/s/abc',
    });

    expect(tags.og['og:description']).toBe('Custom description');
  });

  it('should include image when provided', () => {
    const tags = generateMetaTags({
      title: 'Coffee',
      imageUrl: 'https://example.com/image.jpg',
      url: 'https://example.com/s/abc',
    });

    expect(tags.og['og:image']).toBe('https://example.com/image.jpg');
    expect(tags.twitter['twitter:image']).toBe('https://example.com/image.jpg');
    expect(tags.twitter['twitter:card']).toBe('summary_large_image');
  });

  it('should use summary card when no image', () => {
    const tags = generateMetaTags({
      title: 'Coffee',
      url: 'https://example.com/s/abc',
    });

    expect(tags.twitter['twitter:card']).toBe('summary');
  });
});

describe('metaTagsToHtml', () => {
  it('should convert tags to HTML', () => {
    const tags = generateMetaTags({
      title: 'Test',
      url: 'https://example.com',
    });

    const html = metaTagsToHtml(tags);

    expect(html).toContain('<title>');
    expect(html).toContain('og:title');
    expect(html).toContain('twitter:title');
  });

  it('should escape HTML characters', () => {
    const tags = generateMetaTags({
      title: 'Test <script>',
      url: 'https://example.com',
    });

    const html = metaTagsToHtml(tags);

    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
});

describe('generateJsonLd', () => {
  it('should generate valid JSON-LD', () => {
    const jsonLd = generateJsonLd({
      title: 'Coffee Payment',
      amount: '5',
      assetCode: 'XLM',
      url: 'https://example.com/s/abc',
    }) as Record<string, unknown>;

    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(jsonLd['@type']).toBe('PaymentService');
    expect(jsonLd.name).toBe('Coffee Payment');
  });

  it('should include price offer when amount provided', () => {
    const jsonLd = generateJsonLd({
      title: 'Test',
      amount: '10',
      url: 'https://example.com',
    }) as Record<string, unknown>;

    expect(jsonLd.offers).toBeDefined();
  });
});
