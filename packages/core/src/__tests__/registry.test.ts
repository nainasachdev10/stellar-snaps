import { describe, it, expect } from 'vitest';
import {
  createRegistry,
  addDomain,
  removeDomain,
  getDomainStatus,
  isDomainVerified,
  isDomainBlocked,
  getVerifiedDomains,
  validateRegistry,
} from '../registry';

describe('createRegistry', () => {
  it('should create empty registry', () => {
    const registry = createRegistry();
    expect(registry.domains).toEqual([]);
    expect(registry.version).toBe('1.0.0');
  });

  it('should create registry with domains', () => {
    const registry = createRegistry([
      { domain: 'example.com', status: 'verified' },
    ]);
    expect(registry.domains).toHaveLength(1);
  });
});

describe('addDomain', () => {
  it('should add new domain', () => {
    const registry = createRegistry();
    const updated = addDomain(registry, { domain: 'test.com', status: 'verified' });
    expect(updated.domains).toHaveLength(1);
    expect(updated.domains[0]?.domain).toBe('test.com');
  });

  it('should update existing domain', () => {
    const registry = createRegistry([
      { domain: 'test.com', status: 'unverified' },
    ]);
    const updated = addDomain(registry, { domain: 'test.com', status: 'verified' });
    expect(updated.domains).toHaveLength(1);
    expect(updated.domains[0]?.status).toBe('verified');
  });
});

describe('removeDomain', () => {
  it('should remove domain', () => {
    const registry = createRegistry([
      { domain: 'test.com', status: 'verified' },
    ]);
    const updated = removeDomain(registry, 'test.com');
    expect(updated.domains).toHaveLength(0);
  });
});

describe('getDomainStatus', () => {
  it('should find domain', () => {
    const registry = createRegistry([
      { domain: 'test.com', status: 'verified', name: 'Test' },
    ]);
    const entry = getDomainStatus(registry, 'test.com');
    expect(entry?.status).toBe('verified');
    expect(entry?.name).toBe('Test');
  });

  it('should return null for unknown domain', () => {
    const registry = createRegistry();
    expect(getDomainStatus(registry, 'unknown.com')).toBeNull();
  });

  it('should normalize www prefix', () => {
    const registry = createRegistry([
      { domain: 'test.com', status: 'verified' },
    ]);
    expect(getDomainStatus(registry, 'www.test.com')?.status).toBe('verified');
  });
});

describe('isDomainVerified', () => {
  it('should check verified status', () => {
    const registry = createRegistry([
      { domain: 'verified.com', status: 'verified' },
      { domain: 'unverified.com', status: 'unverified' },
    ]);
    expect(isDomainVerified(registry, 'verified.com')).toBe(true);
    expect(isDomainVerified(registry, 'unverified.com')).toBe(false);
    expect(isDomainVerified(registry, 'unknown.com')).toBe(false);
  });
});

describe('isDomainBlocked', () => {
  it('should check blocked status', () => {
    const registry = createRegistry([
      { domain: 'blocked.com', status: 'blocked' },
    ]);
    expect(isDomainBlocked(registry, 'blocked.com')).toBe(true);
    expect(isDomainBlocked(registry, 'other.com')).toBe(false);
  });
});

describe('getVerifiedDomains', () => {
  it('should return only verified domains', () => {
    const registry = createRegistry([
      { domain: 'a.com', status: 'verified' },
      { domain: 'b.com', status: 'unverified' },
      { domain: 'c.com', status: 'verified' },
    ]);
    const verified = getVerifiedDomains(registry);
    expect(verified).toHaveLength(2);
    expect(verified.map((d) => d.domain)).toEqual(['a.com', 'c.com']);
  });
});

describe('validateRegistry', () => {
  it('should validate correct registry', () => {
    expect(validateRegistry({
      domains: [{ domain: 'test.com', status: 'verified' }],
      updatedAt: '2024-01-01',
      version: '1.0.0',
    })).toBe(true);
  });

  it('should reject invalid registry', () => {
    expect(validateRegistry(null)).toBe(false);
    expect(validateRegistry({})).toBe(false);
    expect(validateRegistry({ domains: 'not-array' })).toBe(false);
  });
});
