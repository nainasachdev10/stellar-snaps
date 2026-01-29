import { NETWORK_PASSPHRASES, type Network } from './constants';
import { InvalidUriError } from './errors';

/**
 * Options for creating a transaction snap URI.
 * Used for advanced use cases where you need to sign arbitrary transactions,
 * not just simple payments.
 */
export interface TransactionSnapOptions {
  /** The transaction in XDR format (Stellar's binary encoding) */
  xdr: string;
  /** The network this transaction is for (default: 'public') */
  network?: Network;
  /** Human-readable message to show the user when signing */
  message?: string;
  /** URL to call after the transaction is signed */
  callback?: string;
  /** Public key of the required signer */
  pubkey?: string;
}

/**
 * Result of creating a transaction snap.
 */
export interface TransactionSnapResult {
  /** The complete SEP-0007 URI */
  uri: string;
  /** The parsed parameters */
  params: Record<string, string>;
}

/**
 * Creates a SEP-0007 transaction URI for signing arbitrary Stellar transactions.
 *
 * Unlike payment snaps which are for simple payments, transaction snaps can
 * encode any Stellar transaction (multi-operation, account creation, etc.).
 *
 * @param options - Transaction snap configuration
 * @returns The generated URI and parsed parameters
 * @throws {InvalidUriError} If the XDR is missing or invalid
 *
 * @example
 * ```typescript
 * const { uri } = createTransactionSnap({
 *   xdr: 'AAAA...', // Your transaction XDR
 *   network: 'testnet',
 *   message: 'Please sign this transaction',
 * });
 * // => web+stellar:tx?xdr=AAAA...&network_passphrase=Test%20SDF%20Network...
 * ```
 */
export function createTransactionSnap(options: TransactionSnapOptions): TransactionSnapResult {
  const { xdr, network = 'public', message, callback, pubkey } = options;

  if (!xdr || typeof xdr !== 'string') {
    throw new InvalidUriError('XDR is required for transaction snaps');
  }

  const params: Record<string, string> = {
    xdr: xdr,
  };

  // Add network passphrase if not public (public is the default)
  if (network !== 'public') {
    params.network_passphrase = NETWORK_PASSPHRASES[network];
  }

  if (message) {
    if (message.length > 300) {
      throw new InvalidUriError('Message cannot exceed 300 characters');
    }
    params.msg = message;
  }

  if (callback) {
    params.callback = `url:${callback}`;
  }

  if (pubkey) {
    params.pubkey = pubkey;
  }

  const queryString = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

  return {
    uri: `web+stellar:tx?${queryString}`,
    params,
  };
}
