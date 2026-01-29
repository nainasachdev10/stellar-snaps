/**
 * Validates a Stellar public address.
 * Valid addresses are 56 characters long and start with 'G'.
 *
 * @param address - The address to validate
 * @returns true if the address is valid
 *
 * @example
 * ```typescript
 * isValidStellarAddress('GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOUJ3DTJE4QRK764');
 * // => true
 *
 * isValidStellarAddress('invalid');
 * // => false
 * ```
 */
export function isValidStellarAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }
  return address.length === 56 && address.startsWith('G');
}

/**
 * Validates a Stellar asset code.
 * Asset codes are 1-12 alphanumeric characters.
 * "XLM" is the native asset and is always valid.
 *
 * @param code - The asset code to validate
 * @returns true if the asset code is valid
 *
 * @example
 * ```typescript
 * isValidAssetCode('USDC');
 * // => true
 *
 * isValidAssetCode('XLM');
 * // => true
 *
 * isValidAssetCode('ThisIsTooLongForAnAssetCode');
 * // => false
 * ```
 */
export function isValidAssetCode(code: string): boolean {
  if (!code || typeof code !== 'string') {
    return false;
  }
  // Asset codes are 1-12 alphanumeric characters
  return /^[a-zA-Z0-9]{1,12}$/.test(code);
}

/**
 * Validates a payment amount.
 * Amounts must be positive numbers represented as strings.
 * Stellar supports up to 7 decimal places.
 *
 * @param amount - The amount to validate
 * @returns true if the amount is valid
 *
 * @example
 * ```typescript
 * isValidAmount('10');
 * // => true
 *
 * isValidAmount('0.0000001');
 * // => true
 *
 * isValidAmount('-5');
 * // => false
 *
 * isValidAmount('0');
 * // => false
 * ```
 */
export function isValidAmount(amount: string): boolean {
  if (!amount || typeof amount !== 'string') {
    return false;
  }
  const num = Number(amount);
  return !isNaN(num) && num > 0 && isFinite(num);
}
