import {
  isConnected,
  isAllowed,
  setAllowed,
  getAddress,
  getNetwork,
  signTransaction,
} from '@stellar/freighter-api';
import * as StellarSdk from '@stellar/stellar-sdk';
import { NETWORK_PASSPHRASES, HORIZON_URLS, type Network } from './constants';
import { StellarSnapError } from './errors';

/**
 * Result of connecting to Freighter wallet.
 */
export interface FreighterConnectionResult {
  /** The user's Stellar public address */
  publicKey: string;
  /** The network the wallet is connected to */
  network: Network;
}

/**
 * Result of submitting a transaction.
 */
export interface TransactionSubmitResult {
  /** The transaction hash (can be used in block explorers) */
  hash: string;
  /** Whether the transaction was successful */
  successful: boolean;
  /** The ledger number the transaction was included in */
  ledger?: number;
}

/**
 * Checks if Freighter wallet extension is installed and connected.
 *
 * @returns true if Freighter is installed and the user has granted access
 *
 * @example
 * ```typescript
 * if (await isFreighterConnected()) {
 *   console.log('Ready to sign transactions!');
 * } else {
 *   console.log('Please connect your Freighter wallet');
 * }
 * ```
 */
export async function isFreighterConnected(): Promise<boolean> {
  try {
    const connected = await isConnected();
    if (!connected) return false;

    const allowedResult = await isAllowed();
    return allowedResult.isAllowed;
  } catch {
    return false;
  }
}

/**
 * Gets the current network from Freighter wallet.
 *
 * @returns The network the user's wallet is connected to
 * @throws {StellarSnapError} If unable to get network
 *
 * @example
 * ```typescript
 * const network = await getFreighterNetwork();
 * console.log(`Connected to ${network}`); // 'public' or 'testnet'
 * ```
 */
export async function getFreighterNetwork(): Promise<Network> {
  try {
    const networkDetails = await getNetwork();
    const passphrase = networkDetails.networkPassphrase;

    if (passphrase === NETWORK_PASSPHRASES.public) {
      return 'public';
    } else if (passphrase === NETWORK_PASSPHRASES.testnet) {
      return 'testnet';
    }

    // Default to testnet for unknown networks
    return 'testnet';
  } catch (error) {
    throw new StellarSnapError(
      `Failed to get network from Freighter: ${error}`,
      'FREIGHTER_NETWORK_ERROR'
    );
  }
}

/**
 * Connects to the Freighter wallet and returns the user's public key and network.
 *
 * This will prompt the user to grant access if they haven't already.
 *
 * @returns The user's public key and current network
 * @throws {StellarSnapError} If Freighter is not installed or connection fails
 *
 * @example
 * ```typescript
 * try {
 *   const { publicKey, network } = await connectFreighter();
 *   console.log(`Connected: ${publicKey} on ${network}`);
 * } catch (error) {
 *   console.error('Failed to connect:', error.message);
 * }
 * ```
 */
export async function connectFreighter(): Promise<FreighterConnectionResult> {
  try {
    // Check if Freighter is installed
    const connected = await isConnected();
    if (!connected) {
      throw new StellarSnapError(
        'Freighter wallet is not installed. Please install it from https://freighter.app',
        'FREIGHTER_NOT_INSTALLED'
      );
    }

    // Request access if not already allowed
    const allowedResult = await isAllowed();
    if (!allowedResult.isAllowed) {
      await setAllowed();
    }

    // Get the user's address
    const addressResult = await getAddress();
    if (!addressResult.address) {
      throw new StellarSnapError(
        'Failed to get address from Freighter',
        'FREIGHTER_ADDRESS_ERROR'
      );
    }

    // Get the network
    const network = await getFreighterNetwork();

    return {
      publicKey: addressResult.address,
      network,
    };
  } catch (error) {
    if (error instanceof StellarSnapError) {
      throw error;
    }
    throw new StellarSnapError(
      `Failed to connect to Freighter: ${error}`,
      'FREIGHTER_CONNECTION_ERROR'
    );
  }
}

/**
 * Signs a transaction using Freighter wallet.
 *
 * This will open the Freighter popup for the user to review and approve the transaction.
 *
 * @param xdr - The unsigned transaction XDR
 * @param network - The network the transaction is for
 * @returns The signed transaction XDR
 * @throws {StellarSnapError} If signing fails or user rejects
 *
 * @example
 * ```typescript
 * const unsignedXdr = buildPaymentTransaction({ ... });
 * const signedXdr = await signWithFreighter(unsignedXdr, 'public');
 * ```
 */
export async function signWithFreighter(
  xdr: string,
  network: Network
): Promise<string> {
  try {
    const networkPassphrase = NETWORK_PASSPHRASES[network];
    const result = await signTransaction(xdr, {
      networkPassphrase,
    });

    if (!result.signedTxXdr) {
      throw new StellarSnapError(
        'Transaction signing was cancelled or failed',
        'FREIGHTER_SIGN_CANCELLED'
      );
    }

    return result.signedTxXdr;
  } catch (error) {
    if (error instanceof StellarSnapError) {
      throw error;
    }
    throw new StellarSnapError(
      `Failed to sign transaction: ${error}`,
      'FREIGHTER_SIGN_ERROR'
    );
  }
}

/**
 * Submits a signed transaction to the Stellar network.
 *
 * @param signedXdr - The signed transaction XDR
 * @param network - The network to submit to
 * @returns The transaction result including hash and success status
 * @throws {StellarSnapError} If submission fails
 *
 * @example
 * ```typescript
 * const signedXdr = await signWithFreighter(unsignedXdr, 'public');
 * const result = await submitTransaction(signedXdr, 'public');
 *
 * if (result.successful) {
 *   console.log(`Transaction successful! Hash: ${result.hash}`);
 *   console.log(`View on explorer: https://stellar.expert/explorer/public/tx/${result.hash}`);
 * }
 * ```
 */
export async function submitTransaction(
  signedXdr: string,
  network: Network
): Promise<TransactionSubmitResult> {
  try {
    const horizonUrl = HORIZON_URLS[network];
    const server = new StellarSdk.Horizon.Server(horizonUrl);
    const networkPassphrase = NETWORK_PASSPHRASES[network];

    // Parse the signed transaction
    const transaction = StellarSdk.TransactionBuilder.fromXDR(
      signedXdr,
      networkPassphrase
    );

    // Submit to the network
    const response = await server.submitTransaction(transaction);

    return {
      hash: response.hash,
      successful: response.successful,
      ledger: response.ledger,
    };
  } catch (error: unknown) {
    // Handle Horizon error responses
    const horizonError = error as { response?: { data?: { extras?: { result_codes?: unknown } } }; message?: string };
    if (horizonError.response?.data?.extras?.result_codes) {
      const resultCodes = horizonError.response.data.extras.result_codes;
      throw new StellarSnapError(
        `Transaction failed: ${JSON.stringify(resultCodes)}`,
        'TRANSACTION_FAILED'
      );
    }

    throw new StellarSnapError(
      `Failed to submit transaction: ${horizonError.message || error}`,
      'SUBMIT_ERROR'
    );
  }
}
