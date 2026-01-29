/**
 * Stellar network passphrases used for transaction signing.
 * Each network has a unique passphrase that identifies it.
 */
export const NETWORK_PASSPHRASES = {
  public: 'Public Global Stellar Network ; September 2015',
  testnet: 'Test SDF Network ; September 2015',
} as const;

/**
 * Horizon API URLs for each Stellar network.
 * Horizon is the REST API for interacting with the Stellar network.
 */
export const HORIZON_URLS = {
  public: 'https://horizon.stellar.org',
  testnet: 'https://horizon-testnet.stellar.org',
} as const;

/**
 * Supported Stellar networks.
 * - `public`: The main Stellar network (real money)
 * - `testnet`: Test network for development (free test tokens)
 */
export type Network = 'public' | 'testnet';

/**
 * Stellar memo types for attaching metadata to transactions.
 * - `MEMO_TEXT`: Plain text (max 28 bytes)
 * - `MEMO_ID`: 64-bit unsigned integer
 * - `MEMO_HASH`: 32-byte hash
 * - `MEMO_RETURN`: 32-byte hash (for returning payments)
 */
export type MemoType = 'MEMO_TEXT' | 'MEMO_ID' | 'MEMO_HASH' | 'MEMO_RETURN';
