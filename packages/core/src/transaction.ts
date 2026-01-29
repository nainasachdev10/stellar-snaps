import * as StellarSdk from '@stellar/stellar-sdk';
import { NETWORK_PASSPHRASES, type Network, type MemoType } from './constants';
import { InvalidAddressError, InvalidAmountError, InvalidAssetError } from './errors';
import { isValidStellarAddress, isValidAmount } from './validation';

/**
 * Options for building a payment transaction.
 */
export interface BuildPaymentOptions {
  /** The payer's Stellar public address */
  source: string;
  /** The account sequence number (prevents replay attacks) */
  sequence: string;
  /** The recipient's Stellar public address */
  destination: string;
  /** The amount to send (as a string for precision) */
  amount: string;
  /** The asset to send (defaults to XLM if not specified) */
  asset?: {
    /** Asset code, e.g., "USDC", "XLM" */
    code: string;
    /** Asset issuer address (required for non-XLM assets) */
    issuer?: string;
  };
  /** Optional memo to attach to the transaction */
  memo?: {
    /** The memo type */
    type: MemoType;
    /** The memo value */
    value: string;
  };
  /** The network to build for */
  network: Network;
  /** Transaction validity timeout in seconds (default: 180) */
  timeout?: number;
}

/**
 * Creates a Stellar Asset object.
 *
 * @param code - The asset code (e.g., "XLM", "USDC")
 * @param issuer - The asset issuer address (required for non-XLM assets)
 * @returns A Stellar Asset object
 * @throws {InvalidAssetError} If a non-XLM asset is missing an issuer
 *
 * @example
 * ```typescript
 * // Native XLM
 * const xlm = createAsset('XLM');
 *
 * // Custom asset
 * const usdc = createAsset('USDC', 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN');
 * ```
 */
export function createAsset(code: string, issuer?: string): StellarSdk.Asset {
  if (!code || code.toUpperCase() === 'XLM') {
    return StellarSdk.Asset.native();
  }

  if (!issuer) {
    throw new InvalidAssetError(`Asset issuer is required for non-XLM asset: ${code}`);
  }

  if (!isValidStellarAddress(issuer)) {
    throw new InvalidAssetError(`Invalid asset issuer address: ${issuer}`);
  }

  return new StellarSdk.Asset(code, issuer);
}

/**
 * Builds a Stellar payment transaction and returns the XDR.
 *
 * This function creates a complete unsigned transaction that can be
 * signed by a wallet like Freighter.
 *
 * @param options - The payment options
 * @returns The transaction XDR string
 * @throws {InvalidAddressError} If source or destination address is invalid
 * @throws {InvalidAmountError} If amount is invalid
 * @throws {InvalidAssetError} If asset configuration is invalid
 *
 * @example
 * ```typescript
 * const xdr = buildPaymentTransaction({
 *   source: 'GDQP2K...',
 *   sequence: '123456789',
 *   destination: 'GBZX...',
 *   amount: '10.5',
 *   asset: { code: 'USDC', issuer: 'GA5ZS...' },
 *   memo: { type: 'MEMO_TEXT', value: 'Payment for coffee' },
 *   network: 'public',
 * });
 * ```
 */
export function buildPaymentTransaction(options: BuildPaymentOptions): string {
  const {
    source,
    sequence,
    destination,
    amount,
    asset,
    memo,
    network,
    timeout = 180,
  } = options;

  // Validate inputs
  if (!isValidStellarAddress(source)) {
    throw new InvalidAddressError(source);
  }

  if (!isValidStellarAddress(destination)) {
    throw new InvalidAddressError(destination);
  }

  if (!isValidAmount(amount)) {
    throw new InvalidAmountError(amount);
  }

  const networkPassphrase = NETWORK_PASSPHRASES[network];

  // Create a minimal account object for TransactionBuilder
  const sourceAccount = new StellarSdk.Account(source, sequence);

  // Build transaction
  const builder = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase,
  });

  // Determine asset
  const stellarAsset = asset
    ? createAsset(asset.code, asset.issuer)
    : StellarSdk.Asset.native();

  // Add payment operation
  builder.addOperation(
    StellarSdk.Operation.payment({
      destination,
      asset: stellarAsset,
      amount: String(amount),
    })
  );

  // Add memo if present
  if (memo) {
    switch (memo.type) {
      case 'MEMO_ID':
        builder.addMemo(StellarSdk.Memo.id(memo.value));
        break;
      case 'MEMO_HASH':
        builder.addMemo(StellarSdk.Memo.hash(memo.value));
        break;
      case 'MEMO_RETURN':
        builder.addMemo(StellarSdk.Memo.return(memo.value));
        break;
      case 'MEMO_TEXT':
      default:
        builder.addMemo(StellarSdk.Memo.text(memo.value));
        break;
    }
  }

  // Set timeout and build
  builder.setTimeout(timeout);
  const transaction = builder.build();

  return transaction.toXDR();
}
