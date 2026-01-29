/**
 * Base error class for all Stellar Snaps SDK errors.
 * Includes an error code for programmatic error handling.
 */
export class StellarSnapError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'StellarSnapError';
  }
}

/**
 * Thrown when a Stellar address is invalid.
 * Valid addresses are 56 characters long and start with 'G'.
 */
export class InvalidAddressError extends StellarSnapError {
  constructor(address: string) {
    super(`Invalid Stellar address: ${address}`, 'INVALID_ADDRESS');
    this.name = 'InvalidAddressError';
  }
}

/**
 * Thrown when an amount is invalid.
 * Amounts must be positive numbers represented as strings.
 */
export class InvalidAmountError extends StellarSnapError {
  constructor(amount: string) {
    super(`Invalid amount: ${amount}. Must be a positive number.`, 'INVALID_AMOUNT');
    this.name = 'InvalidAmountError';
  }
}

/**
 * Thrown when an asset configuration is invalid.
 * Non-XLM assets require both a code and an issuer address.
 */
export class InvalidAssetError extends StellarSnapError {
  constructor(message: string) {
    super(message, 'INVALID_ASSET');
    this.name = 'InvalidAssetError';
  }
}

/**
 * Thrown when a SEP-0007 URI is invalid or malformed.
 */
export class InvalidUriError extends StellarSnapError {
  constructor(message: string) {
    super(message, 'INVALID_URI');
    this.name = 'InvalidUriError';
  }
}

/**
 * Thrown when a snap is not found (404 from API).
 */
export class SnapNotFoundError extends StellarSnapError {
  constructor(snapId: string) {
    super(`Snap not found: ${snapId}`, 'SNAP_NOT_FOUND');
    this.name = 'SnapNotFoundError';
  }
}

/**
 * Thrown when the caller is not authorized to perform the action (e.g. delete another user's snap).
 */
export class SnapUnauthorizedError extends StellarSnapError {
  constructor(message: string = 'Unauthorized') {
    super(message, 'SNAP_UNAUTHORIZED');
    this.name = 'SnapUnauthorizedError';
  }
}

/**
 * Thrown when the Stellar Snaps API returns an error.
 */
export class SnapApiError extends StellarSnapError {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message, 'SNAP_API_ERROR');
    this.name = 'SnapApiError';
  }
}
