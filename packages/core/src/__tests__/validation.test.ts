import { describe, it, expect } from 'vitest';
import {
  isValidStellarAddress,
  isValidAssetCode,
  isValidAmount,
} from '../validation';

describe('isValidStellarAddress', () => {
  it('should return true for valid Stellar addresses', () => {
    // Valid address: 56 chars, starts with G
    const validAddress = 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOUJ3DTJE4QRK764';
    expect(isValidStellarAddress(validAddress)).toBe(true);
  });

  it('should return false for addresses not starting with G', () => {
    const invalidAddress = 'ADQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOUJ3DTJE4QRK764';
    expect(isValidStellarAddress(invalidAddress)).toBe(false);
  });

  it('should return false for addresses with wrong length', () => {
    expect(isValidStellarAddress('GDQP2K')).toBe(false);
    expect(isValidStellarAddress('')).toBe(false);
  });

  it('should return false for null/undefined', () => {
    expect(isValidStellarAddress(null as unknown as string)).toBe(false);
    expect(isValidStellarAddress(undefined as unknown as string)).toBe(false);
  });
});

describe('isValidAssetCode', () => {
  it('should return true for valid asset codes', () => {
    expect(isValidAssetCode('XLM')).toBe(true);
    expect(isValidAssetCode('USDC')).toBe(true);
    expect(isValidAssetCode('BTC')).toBe(true);
    expect(isValidAssetCode('AQUA')).toBe(true);
    expect(isValidAssetCode('yXLM')).toBe(true);
  });

  it('should return true for 12-character asset codes', () => {
    expect(isValidAssetCode('ABCDEFGHIJKL')).toBe(true);
  });

  it('should return false for asset codes longer than 12 characters', () => {
    expect(isValidAssetCode('ABCDEFGHIJKLM')).toBe(false);
  });

  it('should return false for empty strings', () => {
    expect(isValidAssetCode('')).toBe(false);
  });

  it('should return false for asset codes with special characters', () => {
    expect(isValidAssetCode('USD-C')).toBe(false);
    expect(isValidAssetCode('US DC')).toBe(false);
  });
});

describe('isValidAmount', () => {
  it('should return true for positive amounts', () => {
    expect(isValidAmount('10')).toBe(true);
    expect(isValidAmount('0.5')).toBe(true);
    expect(isValidAmount('100.123456')).toBe(true);
    expect(isValidAmount('0.0000001')).toBe(true);
  });

  it('should return false for zero', () => {
    expect(isValidAmount('0')).toBe(false);
  });

  it('should return false for negative amounts', () => {
    expect(isValidAmount('-10')).toBe(false);
    expect(isValidAmount('-0.5')).toBe(false);
  });

  it('should return false for non-numeric strings', () => {
    expect(isValidAmount('abc')).toBe(false);
    expect(isValidAmount('10abc')).toBe(false);
  });

  it('should return false for empty strings', () => {
    expect(isValidAmount('')).toBe(false);
  });
});
