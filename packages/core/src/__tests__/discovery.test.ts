import { describe, it, expect } from 'vitest';
import {
  createDiscoveryFile,
  validateDiscoveryFile,
  matchUrlToRule,
} from '../discovery';

describe('createDiscoveryFile', () => {
  it('should create a valid discovery file', () => {
    const result = createDiscoveryFile({
      name: 'My Payment App',
      rules: [{ pathPattern: '/pay/*', apiPath: '/api/snap/$1' }],
    });

    expect(result.name).toBe('My Payment App');
    expect(result.rules).toHaveLength(1);
    expect(result.rules[0]?.pathPattern).toBe('/pay/*');
  });

  it('should include optional fields when provided', () => {
    const result = createDiscoveryFile({
      name: 'My App',
      description: 'A payment app',
      icon: 'https://example.com/icon.png',
      rules: [{ pathPattern: '/s/*', apiPath: '/api/snap/$1' }],
    });

    expect(result.description).toBe('A payment app');
    expect(result.icon).toBe('https://example.com/icon.png');
  });

  it('should throw error when name is missing', () => {
    expect(() =>
      createDiscoveryFile({
        name: '',
        rules: [{ pathPattern: '/s/*', apiPath: '/api/snap/$1' }],
      })
    ).toThrow('Discovery file requires a name');
  });

  it('should throw error when rules are empty', () => {
    expect(() =>
      createDiscoveryFile({
        name: 'My App',
        rules: [],
      })
    ).toThrow('Discovery file requires at least one rule');
  });
});

describe('validateDiscoveryFile', () => {
  it('should return true for valid discovery file', () => {
    const file = {
      name: 'My App',
      rules: [{ pathPattern: '/s/*', apiPath: '/api/snap/$1' }],
    };

    expect(validateDiscoveryFile(file)).toBe(true);
  });

  it('should return true for discovery file with optional fields', () => {
    const file = {
      name: 'My App',
      description: 'A payment app',
      icon: 'https://example.com/icon.png',
      rules: [{ pathPattern: '/s/*', apiPath: '/api/snap/$1' }],
    };

    expect(validateDiscoveryFile(file)).toBe(true);
  });

  it('should return false for null/undefined', () => {
    expect(validateDiscoveryFile(null)).toBe(false);
    expect(validateDiscoveryFile(undefined)).toBe(false);
  });

  it('should return false for missing name', () => {
    const file = {
      rules: [{ pathPattern: '/s/*', apiPath: '/api/snap/$1' }],
    };

    expect(validateDiscoveryFile(file)).toBe(false);
  });

  it('should return false for empty rules', () => {
    const file = {
      name: 'My App',
      rules: [],
    };

    expect(validateDiscoveryFile(file)).toBe(false);
  });

  it('should return false for invalid rule structure', () => {
    const file = {
      name: 'My App',
      rules: [{ pathPattern: '/s/*' }], // missing apiPath
    };

    expect(validateDiscoveryFile(file)).toBe(false);
  });
});

describe('matchUrlToRule', () => {
  const rules = [
    { pathPattern: '/s/*', apiPath: '/api/snap/$1' },
    { pathPattern: '/pay/*', apiPath: '/api/payment/$1' },
    { pathPattern: '/user/*/donate', apiPath: '/api/donate/$1' },
  ];

  it('should match simple wildcard pattern', () => {
    const result = matchUrlToRule('/s/abc123', rules);
    expect(result).toBe('/api/snap/abc123');
  });

  it('should match different patterns', () => {
    const result = matchUrlToRule('/pay/xyz789', rules);
    expect(result).toBe('/api/payment/xyz789');
  });

  it('should handle wildcards in middle of path', () => {
    const result = matchUrlToRule('/user/john/donate', rules);
    expect(result).toBe('/api/donate/john');
  });

  it('should return null for non-matching paths', () => {
    const result = matchUrlToRule('/unknown/path', rules);
    expect(result).toBeNull();
  });

  it('should return null for partial matches', () => {
    const result = matchUrlToRule('/s', rules); // missing the second part
    expect(result).toBeNull();
  });
});
