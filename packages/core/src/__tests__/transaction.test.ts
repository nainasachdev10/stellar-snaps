import { describe, it, expect } from 'vitest';
import { buildPaymentTransaction, createAsset } from '../transaction';
import { InvalidAddressError, InvalidAmountError, InvalidAssetError } from '../errors';

// These are valid Stellar testnet addresses (cryptographically valid with correct checksums)
const VALID_SOURCE = 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7';
const VALID_DESTINATION = 'GCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DOSJBV7STMAQSMTGG';

describe('createAsset', () => {
  it('should create native XLM asset', () => {
    const asset = createAsset('XLM');
    expect(asset.isNative()).toBe(true);
  });

  it('should create native asset for empty code', () => {
    const asset = createAsset('');
    expect(asset.isNative()).toBe(true);
  });

  it('should create native asset for xlm (lowercase)', () => {
    const asset = createAsset('xlm');
    expect(asset.isNative()).toBe(true);
  });

  it('should create custom asset with issuer', () => {
    const asset = createAsset('USDC', VALID_DESTINATION);
    expect(asset.isNative()).toBe(false);
    expect(asset.getCode()).toBe('USDC');
    expect(asset.getIssuer()).toBe(VALID_DESTINATION);
  });

  it('should throw error for custom asset without issuer', () => {
    expect(() => createAsset('USDC')).toThrow(InvalidAssetError);
    expect(() => createAsset('USDC')).toThrow('Asset issuer is required');
  });

  it('should throw error for invalid issuer address', () => {
    expect(() => createAsset('USDC', 'invalid')).toThrow(InvalidAssetError);
    expect(() => createAsset('USDC', 'invalid')).toThrow('Invalid asset issuer');
  });
});

describe('buildPaymentTransaction', () => {
  const validOptions = {
    source: VALID_SOURCE,
    sequence: '123456789',
    destination: VALID_DESTINATION,
    amount: '100',
    network: 'testnet' as const,
  };

  it('should build a basic XLM payment transaction', () => {
    const xdr = buildPaymentTransaction(validOptions);

    // XDR should be a non-empty string
    expect(typeof xdr).toBe('string');
    expect(xdr.length).toBeGreaterThan(0);
  });

  it('should build transaction with custom asset', () => {
    const xdr = buildPaymentTransaction({
      ...validOptions,
      asset: {
        code: 'USDC',
        issuer: VALID_SOURCE, // Using valid address as issuer
      },
    });

    expect(typeof xdr).toBe('string');
    expect(xdr.length).toBeGreaterThan(0);
  });

  it('should build transaction with memo', () => {
    const xdr = buildPaymentTransaction({
      ...validOptions,
      memo: {
        type: 'MEMO_TEXT',
        value: 'Test payment',
      },
    });

    expect(typeof xdr).toBe('string');
    expect(xdr.length).toBeGreaterThan(0);
  });

  it('should throw InvalidAddressError for invalid source', () => {
    expect(() =>
      buildPaymentTransaction({
        ...validOptions,
        source: 'invalid',
      })
    ).toThrow(InvalidAddressError);
  });

  it('should throw InvalidAddressError for invalid destination', () => {
    expect(() =>
      buildPaymentTransaction({
        ...validOptions,
        destination: 'invalid',
      })
    ).toThrow(InvalidAddressError);
  });

  it('should throw InvalidAmountError for invalid amount', () => {
    expect(() =>
      buildPaymentTransaction({
        ...validOptions,
        amount: '-100',
      })
    ).toThrow(InvalidAmountError);
  });

  it('should throw InvalidAmountError for zero amount', () => {
    expect(() =>
      buildPaymentTransaction({
        ...validOptions,
        amount: '0',
      })
    ).toThrow(InvalidAmountError);
  });

  it('should throw InvalidAssetError for custom asset without issuer', () => {
    expect(() =>
      buildPaymentTransaction({
        ...validOptions,
        asset: {
          code: 'USDC',
        },
      })
    ).toThrow(InvalidAssetError);
  });
});
