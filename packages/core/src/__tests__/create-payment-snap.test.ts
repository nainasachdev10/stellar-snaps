import { describe, it, expect } from 'vitest';
import { createPaymentSnap } from '../create-payment-snap';

const VALID_ADDRESS = 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOUJ3DTJE4QRK764';
const VALID_ISSUER = 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN';

describe('createPaymentSnap', () => {
  it('should create a basic payment URI with just destination', () => {
    const result = createPaymentSnap({
      destination: VALID_ADDRESS,
    });

    expect(result.uri).toContain('web+stellar:pay?');
    expect(result.uri).toContain(`destination=${VALID_ADDRESS}`);
    expect(result.params.destination).toBe(VALID_ADDRESS);
  });

  it('should include amount when provided', () => {
    const result = createPaymentSnap({
      destination: VALID_ADDRESS,
      amount: '100',
    });

    expect(result.uri).toContain('amount=100');
    expect(result.params.amount).toBe('100');
  });

  it('should include asset code and issuer for non-XLM assets', () => {
    const result = createPaymentSnap({
      destination: VALID_ADDRESS,
      amount: '10',
      assetCode: 'USDC',
      assetIssuer: VALID_ISSUER,
    });

    expect(result.uri).toContain('asset_code=USDC');
    expect(result.uri).toContain(`asset_issuer=${encodeURIComponent(VALID_ISSUER)}`);
  });

  it('should include memo when provided', () => {
    const result = createPaymentSnap({
      destination: VALID_ADDRESS,
      memo: 'Payment for coffee',
      memoType: 'MEMO_TEXT',
    });

    expect(result.uri).toContain('memo=Payment');
    expect(result.uri).toContain('memo_type=MEMO_TEXT');
  });

  it('should include network passphrase for testnet', () => {
    const result = createPaymentSnap({
      destination: VALID_ADDRESS,
      network: 'testnet',
    });

    expect(result.uri).toContain('network_passphrase=');
    expect(result.uri).toContain('Test%20SDF%20Network');
  });

  it('should not include network passphrase for public network', () => {
    const result = createPaymentSnap({
      destination: VALID_ADDRESS,
      network: 'public',
    });

    expect(result.uri).not.toContain('network_passphrase');
  });

  it('should include callback URL with url: prefix', () => {
    const result = createPaymentSnap({
      destination: VALID_ADDRESS,
      callback: 'https://example.com/callback',
    });

    expect(result.params.callback).toBe('url:https://example.com/callback');
  });

  it('should throw error for invalid destination address', () => {
    expect(() =>
      createPaymentSnap({
        destination: 'invalid',
      })
    ).toThrow('Invalid destination address');
  });

  it('should throw error for invalid amount', () => {
    expect(() =>
      createPaymentSnap({
        destination: VALID_ADDRESS,
        amount: '-10',
      })
    ).toThrow('Invalid amount');
  });

  it('should throw error for non-XLM asset without issuer', () => {
    expect(() =>
      createPaymentSnap({
        destination: VALID_ADDRESS,
        assetCode: 'USDC',
      })
    ).toThrow('asset_issuer required for non-XLM assets');
  });

  it('should throw error for message exceeding 300 characters', () => {
    const longMessage = 'a'.repeat(301);
    expect(() =>
      createPaymentSnap({
        destination: VALID_ADDRESS,
        message: longMessage,
      })
    ).toThrow('Message cannot exceed 300 characters');
  });
});
