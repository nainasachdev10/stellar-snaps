/**
 * Blockchain Explorer Utilities
 *
 * Generate links to Stellar blockchain explorers.
 */

import type { Network } from './constants';

/** Supported explorer types */
export type ExplorerType = 'stellar.expert' | 'stellarchain' | 'horizon';

/** Explorer base URLs */
export const EXPLORER_URLS: Record<ExplorerType, Record<Network, string>> = {
  'stellar.expert': {
    public: 'https://stellar.expert/explorer/public',
    testnet: 'https://stellar.expert/explorer/testnet',
  },
  stellarchain: {
    public: 'https://stellarchain.io',
    testnet: 'https://testnet.stellarchain.io',
  },
  horizon: {
    public: 'https://horizon.stellar.org',
    testnet: 'https://horizon-testnet.stellar.org',
  },
};

/**
 * Generates a transaction URL for a blockchain explorer.
 *
 * @example
 * ```typescript
 * getTransactionUrl('abc123...', 'testnet');
 * // 'https://stellar.expert/explorer/testnet/tx/abc123...'
 *
 * getTransactionUrl('abc123...', 'public', 'stellarchain');
 * // 'https://stellarchain.io/transactions/abc123...'
 * ```
 */
export function getTransactionUrl(
  hash: string,
  network: Network = 'testnet',
  explorer: ExplorerType = 'stellar.expert'
): string {
  const baseUrl = EXPLORER_URLS[explorer][network];

  switch (explorer) {
    case 'stellar.expert':
      return `${baseUrl}/tx/${hash}`;
    case 'stellarchain':
      return `${baseUrl}/transactions/${hash}`;
    case 'horizon':
      return `${baseUrl}/transactions/${hash}`;
    default:
      return `${baseUrl}/tx/${hash}`;
  }
}

/**
 * Generates an account URL for a blockchain explorer.
 *
 * @example
 * ```typescript
 * getAccountUrl('GABC...', 'testnet');
 * // 'https://stellar.expert/explorer/testnet/account/GABC...'
 * ```
 */
export function getAccountUrl(
  address: string,
  network: Network = 'testnet',
  explorer: ExplorerType = 'stellar.expert'
): string {
  const baseUrl = EXPLORER_URLS[explorer][network];

  switch (explorer) {
    case 'stellar.expert':
      return `${baseUrl}/account/${address}`;
    case 'stellarchain':
      return `${baseUrl}/accounts/${address}`;
    case 'horizon':
      return `${baseUrl}/accounts/${address}`;
    default:
      return `${baseUrl}/account/${address}`;
  }
}

/**
 * Generates an asset URL for a blockchain explorer.
 *
 * @example
 * ```typescript
 * getAssetUrl('USDC', 'GCNY...', 'public');
 * // 'https://stellar.expert/explorer/public/asset/USDC-GCNY...'
 * ```
 */
export function getAssetUrl(
  code: string,
  issuer: string,
  network: Network = 'testnet',
  explorer: ExplorerType = 'stellar.expert'
): string {
  const baseUrl = EXPLORER_URLS[explorer][network];

  switch (explorer) {
    case 'stellar.expert':
      return `${baseUrl}/asset/${code}-${issuer}`;
    case 'stellarchain':
      return `${baseUrl}/assets/${code}:${issuer}`;
    case 'horizon':
      return `${baseUrl}/assets?asset_code=${code}&asset_issuer=${issuer}`;
    default:
      return `${baseUrl}/asset/${code}-${issuer}`;
  }
}

/**
 * Generates an operation URL for a blockchain explorer.
 */
export function getOperationUrl(
  operationId: string,
  network: Network = 'testnet',
  explorer: ExplorerType = 'stellar.expert'
): string {
  const baseUrl = EXPLORER_URLS[explorer][network];

  switch (explorer) {
    case 'stellar.expert':
      return `${baseUrl}/op/${operationId}`;
    case 'stellarchain':
      return `${baseUrl}/operations/${operationId}`;
    case 'horizon':
      return `${baseUrl}/operations/${operationId}`;
    default:
      return `${baseUrl}/op/${operationId}`;
  }
}
