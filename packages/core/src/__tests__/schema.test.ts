import { describe, it, expect } from 'vitest';
import {
  validateSnapInput,
  createSnapObject,
  POSTGRES_SCHEMA,
  SQLITE_SCHEMA,
} from '../schema';

const VALID_ADDRESS = 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7';

describe('validateSnapInput', () => {
  it('should validate correct input', () => {
    expect(() =>
      validateSnapInput({
        creator: VALID_ADDRESS,
        title: 'Test Snap',
        destination: VALID_ADDRESS,
      })
    ).not.toThrow();
  });

  it('should reject invalid creator', () => {
    expect(() =>
      validateSnapInput({
        creator: 'invalid',
        title: 'Test',
        destination: VALID_ADDRESS,
      })
    ).toThrow('Invalid creator address');
  });

  it('should reject invalid destination', () => {
    expect(() =>
      validateSnapInput({
        creator: VALID_ADDRESS,
        title: 'Test',
        destination: 'invalid',
      })
    ).toThrow('Invalid destination address');
  });

  it('should reject empty title', () => {
    expect(() =>
      validateSnapInput({
        creator: VALID_ADDRESS,
        title: '',
        destination: VALID_ADDRESS,
      })
    ).toThrow('Title is required');
  });

  it('should reject long title', () => {
    expect(() =>
      validateSnapInput({
        creator: VALID_ADDRESS,
        title: 'x'.repeat(101),
        destination: VALID_ADDRESS,
      })
    ).toThrow('Title must be 100 characters or less');
  });

  it('should require asset issuer for non-XLM', () => {
    expect(() =>
      validateSnapInput({
        creator: VALID_ADDRESS,
        title: 'Test',
        destination: VALID_ADDRESS,
        assetCode: 'USDC',
      })
    ).toThrow('Asset issuer is required for non-XLM assets');
  });

  it('should reject invalid amount', () => {
    expect(() =>
      validateSnapInput({
        creator: VALID_ADDRESS,
        title: 'Test',
        destination: VALID_ADDRESS,
        amount: '-10',
      })
    ).toThrow('Amount must be a positive number');
  });

  it('should reject invalid network', () => {
    expect(() =>
      validateSnapInput({
        creator: VALID_ADDRESS,
        title: 'Test',
        destination: VALID_ADDRESS,
        network: 'invalid' as 'public',
      })
    ).toThrow('Network must be "public" or "testnet"');
  });
});

describe('createSnapObject', () => {
  it('should create snap with defaults', () => {
    const snap = createSnapObject('abc123', {
      creator: VALID_ADDRESS,
      title: 'Test',
      destination: VALID_ADDRESS,
    });

    expect(snap.id).toBe('abc123');
    expect(snap.assetCode).toBe('XLM');
    expect(snap.network).toBe('testnet');
    expect(snap.memoType).toBe('MEMO_TEXT');
    expect(snap.createdAt).toBeDefined();
  });

  it('should use provided values', () => {
    const snap = createSnapObject('xyz789', {
      creator: VALID_ADDRESS,
      title: 'Custom',
      destination: VALID_ADDRESS,
      amount: '100',
      network: 'public',
      assetCode: 'USDC',
      assetIssuer: VALID_ADDRESS,
    });

    expect(snap.amount).toBe('100');
    expect(snap.network).toBe('public');
    expect(snap.assetCode).toBe('USDC');
  });

  it('should trim title', () => {
    const snap = createSnapObject('id', {
      creator: VALID_ADDRESS,
      title: '  Trimmed  ',
      destination: VALID_ADDRESS,
    });

    expect(snap.title).toBe('Trimmed');
  });
});

describe('Database schemas', () => {
  it('should have PostgreSQL schema', () => {
    expect(POSTGRES_SCHEMA).toContain('CREATE TABLE');
    expect(POSTGRES_SCHEMA).toContain('snaps');
    expect(POSTGRES_SCHEMA).toContain('id TEXT PRIMARY KEY');
  });

  it('should have SQLite schema', () => {
    expect(SQLITE_SCHEMA).toContain('CREATE TABLE');
    expect(SQLITE_SCHEMA).toContain('snaps');
  });
});
