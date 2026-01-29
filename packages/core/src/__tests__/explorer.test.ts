import { describe, it, expect } from 'vitest';
import {
  getTransactionUrl,
  getAccountUrl,
  getAssetUrl,
  EXPLORER_URLS,
} from '../explorer';

const TEST_HASH = 'abc123def456';
const TEST_ADDRESS = 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7';

describe('getTransactionUrl', () => {
  it('should generate stellar.expert URL for testnet', () => {
    const url = getTransactionUrl(TEST_HASH, 'testnet');
    expect(url).toBe(`https://stellar.expert/explorer/testnet/tx/${TEST_HASH}`);
  });

  it('should generate stellar.expert URL for public', () => {
    const url = getTransactionUrl(TEST_HASH, 'public');
    expect(url).toBe(`https://stellar.expert/explorer/public/tx/${TEST_HASH}`);
  });

  it('should generate stellarchain URL', () => {
    const url = getTransactionUrl(TEST_HASH, 'public', 'stellarchain');
    expect(url).toBe(`https://stellarchain.io/transactions/${TEST_HASH}`);
  });

  it('should generate horizon URL', () => {
    const url = getTransactionUrl(TEST_HASH, 'testnet', 'horizon');
    expect(url).toBe(`https://horizon-testnet.stellar.org/transactions/${TEST_HASH}`);
  });
});

describe('getAccountUrl', () => {
  it('should generate account URL', () => {
    const url = getAccountUrl(TEST_ADDRESS, 'testnet');
    expect(url).toBe(`https://stellar.expert/explorer/testnet/account/${TEST_ADDRESS}`);
  });

  it('should generate stellarchain account URL', () => {
    const url = getAccountUrl(TEST_ADDRESS, 'public', 'stellarchain');
    expect(url).toBe(`https://stellarchain.io/accounts/${TEST_ADDRESS}`);
  });
});

describe('getAssetUrl', () => {
  it('should generate asset URL', () => {
    const url = getAssetUrl('USDC', TEST_ADDRESS, 'public');
    expect(url).toBe(`https://stellar.expert/explorer/public/asset/USDC-${TEST_ADDRESS}`);
  });

  it('should generate stellarchain asset URL', () => {
    const url = getAssetUrl('USDC', TEST_ADDRESS, 'public', 'stellarchain');
    expect(url).toBe(`https://stellarchain.io/assets/USDC:${TEST_ADDRESS}`);
  });
});

describe('EXPLORER_URLS', () => {
  it('should have all explorer types', () => {
    expect(EXPLORER_URLS['stellar.expert']).toBeDefined();
    expect(EXPLORER_URLS['stellarchain']).toBeDefined();
    expect(EXPLORER_URLS['horizon']).toBeDefined();
  });

  it('should have both networks', () => {
    expect(EXPLORER_URLS['stellar.expert'].public).toBeDefined();
    expect(EXPLORER_URLS['stellar.expert'].testnet).toBeDefined();
  });
});
