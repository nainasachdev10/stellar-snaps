import { describe, it, expect } from 'vitest';
import {
  isShortenerUrl,
  extractDomain,
  extractPath,
  SHORTENER_DOMAINS,
} from '../url-resolver';

describe('isShortenerUrl', () => {
  it('should detect t.co as shortener', () => {
    expect(isShortenerUrl('https://t.co/abc123')).toBe(true);
  });

  it('should detect bit.ly as shortener', () => {
    expect(isShortenerUrl('https://bit.ly/xyz789')).toBe(true);
  });

  it('should not detect regular domains as shorteners', () => {
    expect(isShortenerUrl('https://stellarsnaps.com/s/abc')).toBe(false);
    expect(isShortenerUrl('https://google.com')).toBe(false);
  });

  it('should handle invalid URLs gracefully', () => {
    expect(isShortenerUrl('not-a-url')).toBe(false);
    expect(isShortenerUrl('')).toBe(false);
  });
});

describe('extractDomain', () => {
  it('should extract domain from URL', () => {
    expect(extractDomain('https://stellarsnaps.com/s/abc')).toBe('stellarsnaps.com');
    expect(extractDomain('https://www.example.com/path')).toBe('www.example.com');
  });

  it('should handle invalid URLs', () => {
    expect(extractDomain('not-a-url')).toBe('');
  });
});

describe('extractPath', () => {
  it('should extract path from URL', () => {
    expect(extractPath('https://stellarsnaps.com/s/abc123')).toBe('/s/abc123');
    expect(extractPath('https://example.com/')).toBe('/');
  });
});

describe('SHORTENER_DOMAINS', () => {
  it('should include common shorteners', () => {
    expect(SHORTENER_DOMAINS).toContain('t.co');
    expect(SHORTENER_DOMAINS).toContain('bit.ly');
    expect(SHORTENER_DOMAINS).toContain('goo.gl');
  });
});
