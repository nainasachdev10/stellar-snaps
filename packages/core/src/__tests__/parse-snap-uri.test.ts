import { describe, it, expect } from 'vitest';
import { parseSnapUri } from '../parse-snap-uri';

const VALID_ADDRESS = 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOUJ3DTJE4QRK764';

describe('parseSnapUri', () => {
  describe('payment URIs', () => {
    it('should parse a basic payment URI', () => {
      const uri = `web+stellar:pay?destination=${VALID_ADDRESS}`;
      const result = parseSnapUri(uri);

      expect(result.type).toBe('pay');
      expect(result.destination).toBe(VALID_ADDRESS);
    });

    it('should parse payment URI with amount', () => {
      const uri = `web+stellar:pay?destination=${VALID_ADDRESS}&amount=100`;
      const result = parseSnapUri(uri);

      expect(result.amount).toBe('100');
    });

    it('should parse payment URI with asset code and issuer', () => {
      const issuer = 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN';
      const uri = `web+stellar:pay?destination=${VALID_ADDRESS}&asset_code=USDC&asset_issuer=${issuer}`;
      const result = parseSnapUri(uri);

      expect(result.assetCode).toBe('USDC');
      expect(result.assetIssuer).toBe(issuer);
    });

    it('should parse payment URI with memo', () => {
      const uri = `web+stellar:pay?destination=${VALID_ADDRESS}&memo=test&memo_type=MEMO_TEXT`;
      const result = parseSnapUri(uri);

      expect(result.memo).toBe('test');
      expect(result.memoType).toBe('MEMO_TEXT');
    });

    it('should parse callback URL and strip url: prefix', () => {
      const uri = `web+stellar:pay?destination=${VALID_ADDRESS}&callback=url:https://example.com`;
      const result = parseSnapUri(uri);

      expect(result.callback).toBe('https://example.com');
    });

    it('should parse network passphrase', () => {
      const passphrase = encodeURIComponent('Test SDF Network ; September 2015');
      const uri = `web+stellar:pay?destination=${VALID_ADDRESS}&network_passphrase=${passphrase}`;
      const result = parseSnapUri(uri);

      expect(result.networkPassphrase).toBe('Test SDF Network ; September 2015');
    });
  });

  describe('transaction URIs', () => {
    it('should parse a transaction URI', () => {
      const xdr = 'AAAAAgAAAADIY...';
      const uri = `web+stellar:tx?xdr=${encodeURIComponent(xdr)}`;
      const result = parseSnapUri(uri);

      expect(result.type).toBe('tx');
      expect(result.xdr).toBe(xdr);
    });

    it('should throw error for tx without xdr', () => {
      const uri = 'web+stellar:tx?msg=test';
      expect(() => parseSnapUri(uri)).toThrow('Missing required parameter: xdr');
    });
  });

  describe('error handling', () => {
    it('should throw error for non-stellar URI', () => {
      expect(() => parseSnapUri('https://example.com')).toThrow(
        'Invalid SEP-0007 URI'
      );
    });

    it('should throw error for invalid operation', () => {
      expect(() => parseSnapUri('web+stellar:invalid?test=1')).toThrow(
        'Invalid operation'
      );
    });

    it('should throw error for pay without destination', () => {
      expect(() => parseSnapUri('web+stellar:pay?amount=10')).toThrow(
        'Missing required parameter: destination'
      );
    });
  });
});
