import { describe, it, expect } from 'vitest';
import {
  StellarSnapError,
  InvalidAddressError,
  InvalidAmountError,
  InvalidAssetError,
  InvalidUriError,
  SnapNotFoundError,
  SnapUnauthorizedError,
  SnapApiError,
} from '../errors';

describe('StellarSnapError', () => {
  it('should create error with message and code', () => {
    const error = new StellarSnapError('Test error', 'TEST_CODE');

    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_CODE');
    expect(error.name).toBe('StellarSnapError');
    expect(error instanceof Error).toBe(true);
  });
});

describe('InvalidAddressError', () => {
  it('should create error with address in message', () => {
    const error = new InvalidAddressError('INVALID123');

    expect(error.message).toContain('INVALID123');
    expect(error.code).toBe('INVALID_ADDRESS');
    expect(error.name).toBe('InvalidAddressError');
    expect(error instanceof StellarSnapError).toBe(true);
  });
});

describe('InvalidAmountError', () => {
  it('should create error with amount in message', () => {
    const error = new InvalidAmountError('-100');

    expect(error.message).toContain('-100');
    expect(error.code).toBe('INVALID_AMOUNT');
    expect(error.name).toBe('InvalidAmountError');
    expect(error instanceof StellarSnapError).toBe(true);
  });
});

describe('InvalidAssetError', () => {
  it('should create error with custom message', () => {
    const error = new InvalidAssetError('Missing issuer for USDC');

    expect(error.message).toBe('Missing issuer for USDC');
    expect(error.code).toBe('INVALID_ASSET');
    expect(error.name).toBe('InvalidAssetError');
    expect(error instanceof StellarSnapError).toBe(true);
  });
});

describe('InvalidUriError', () => {
  it('should create error with custom message', () => {
    const error = new InvalidUriError('Invalid scheme');

    expect(error.message).toBe('Invalid scheme');
    expect(error.code).toBe('INVALID_URI');
    expect(error.name).toBe('InvalidUriError');
    expect(error instanceof StellarSnapError).toBe(true);
  });
});

describe('SnapNotFoundError', () => {
  it('should create error with snap ID in message', () => {
    const error = new SnapNotFoundError('abc123');

    expect(error.message).toBe('Snap not found: abc123');
    expect(error.code).toBe('SNAP_NOT_FOUND');
    expect(error.name).toBe('SnapNotFoundError');
    expect(error instanceof StellarSnapError).toBe(true);
  });
});

describe('SnapUnauthorizedError', () => {
  it('should create error with default or custom message', () => {
    const error = new SnapUnauthorizedError();

    expect(error.message).toBe('Unauthorized');
    expect(error.code).toBe('SNAP_UNAUTHORIZED');
    expect(error.name).toBe('SnapUnauthorizedError');
    expect(error instanceof StellarSnapError).toBe(true);
  });

  it('should accept custom message', () => {
    const error = new SnapUnauthorizedError('You do not have permission');

    expect(error.message).toBe('You do not have permission');
  });
});

describe('SnapApiError', () => {
  it('should create error with message and optional statusCode', () => {
    const error = new SnapApiError('Invalid data', 400);

    expect(error.message).toBe('Invalid data');
    expect(error.code).toBe('SNAP_API_ERROR');
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe('SnapApiError');
    expect(error instanceof StellarSnapError).toBe(true);
  });
});

describe('Error inheritance', () => {
  it('should allow catching all stellar snap errors', () => {
    const errors = [
      new InvalidAddressError('test'),
      new InvalidAmountError('test'),
      new InvalidAssetError('test'),
      new InvalidUriError('test'),
      new SnapNotFoundError('test'),
      new SnapUnauthorizedError(),
      new SnapApiError('test'),
    ];

    for (const error of errors) {
      expect(error instanceof StellarSnapError).toBe(true);
      expect(error instanceof Error).toBe(true);
    }
  });
});
