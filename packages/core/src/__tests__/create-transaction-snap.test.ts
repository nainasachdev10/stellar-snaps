import { describe, it, expect } from 'vitest';
import { createTransactionSnap } from '../create-transaction-snap';

const SAMPLE_XDR = 'AAAAAgAAAADIY...'; // Simplified for testing

describe('createTransactionSnap', () => {
  it('should create a transaction URI with XDR', () => {
    const result = createTransactionSnap({
      xdr: SAMPLE_XDR,
    });

    expect(result.uri).toContain('web+stellar:tx?');
    expect(result.uri).toContain(`xdr=${encodeURIComponent(SAMPLE_XDR)}`);
    expect(result.params.xdr).toBe(SAMPLE_XDR);
  });

  it('should include network passphrase for testnet', () => {
    const result = createTransactionSnap({
      xdr: SAMPLE_XDR,
      network: 'testnet',
    });

    expect(result.uri).toContain('network_passphrase=');
  });

  it('should not include network passphrase for public network', () => {
    const result = createTransactionSnap({
      xdr: SAMPLE_XDR,
      network: 'public',
    });

    expect(result.uri).not.toContain('network_passphrase');
  });

  it('should include message when provided', () => {
    const result = createTransactionSnap({
      xdr: SAMPLE_XDR,
      message: 'Please sign this transaction',
    });

    expect(result.uri).toContain('msg=');
    expect(result.params.msg).toBe('Please sign this transaction');
  });

  it('should include callback with url: prefix', () => {
    const result = createTransactionSnap({
      xdr: SAMPLE_XDR,
      callback: 'https://example.com/callback',
    });

    expect(result.params.callback).toBe('url:https://example.com/callback');
  });

  it('should include pubkey when provided', () => {
    const pubkey = 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOUJ3DTJE4QRK764';
    const result = createTransactionSnap({
      xdr: SAMPLE_XDR,
      pubkey,
    });

    expect(result.params.pubkey).toBe(pubkey);
  });

  it('should throw error when XDR is missing', () => {
    expect(() =>
      createTransactionSnap({
        xdr: '',
      })
    ).toThrow('XDR is required');
  });

  it('should throw error for message exceeding 300 characters', () => {
    const longMessage = 'a'.repeat(301);
    expect(() =>
      createTransactionSnap({
        xdr: SAMPLE_XDR,
        message: longMessage,
      })
    ).toThrow('Message cannot exceed 300 characters');
  });
});
