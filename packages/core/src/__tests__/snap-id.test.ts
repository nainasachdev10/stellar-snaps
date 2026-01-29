import { describe, it, expect } from 'vitest';
import { generateSnapId, isValidSnapId, extractSnapId } from '../snap-id';

describe('generateSnapId', () => {
  it('should generate 8-character ID by default', () => {
    const id = generateSnapId();
    expect(id).toHaveLength(8);
  });

  it('should generate custom length ID', () => {
    expect(generateSnapId(12)).toHaveLength(12);
    expect(generateSnapId(4)).toHaveLength(4);
  });

  it('should generate unique IDs', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ids.add(generateSnapId());
    }
    expect(ids.size).toBe(100);
  });

  it('should only use URL-safe characters', () => {
    for (let i = 0; i < 50; i++) {
      const id = generateSnapId(20);
      expect(id).toMatch(/^[a-zA-Z0-9_-]+$/);
    }
  });
});

describe('isValidSnapId', () => {
  it('should validate correct IDs', () => {
    expect(isValidSnapId('abc12345')).toBe(true);
    expect(isValidSnapId('nk1VNcxo')).toBe(true);
    expect(isValidSnapId('a-b_c')).toBe(true);
  });

  it('should reject invalid IDs', () => {
    expect(isValidSnapId('')).toBe(false);
    expect(isValidSnapId('ab')).toBe(false); // too short
    expect(isValidSnapId('has spaces')).toBe(false);
    expect(isValidSnapId('has.dots')).toBe(false);
    expect(isValidSnapId(null as unknown as string)).toBe(false);
  });
});

describe('extractSnapId', () => {
  it('should extract ID from /s/ pattern', () => {
    expect(extractSnapId('https://stellarsnaps.com/s/nk1VNcxo')).toBe('nk1VNcxo');
    expect(extractSnapId('https://example.com/s/abc123')).toBe('abc123');
  });

  it('should extract ID from /snap/ pattern', () => {
    expect(extractSnapId('https://example.com/snap/xyz789')).toBe('xyz789');
  });

  it('should extract ID from /pay/ pattern', () => {
    expect(extractSnapId('https://example.com/pay/test123')).toBe('test123');
  });

  it('should handle custom patterns', () => {
    expect(extractSnapId('https://example.com/p/custom', ['/p/'])).toBe('custom');
  });

  it('should return null for no match', () => {
    expect(extractSnapId('https://example.com/other/path')).toBeNull();
    expect(extractSnapId('not-a-url')).toBeNull();
  });

  it('should handle trailing path segments', () => {
    expect(extractSnapId('https://example.com/s/abc123/details')).toBe('abc123');
  });
});
