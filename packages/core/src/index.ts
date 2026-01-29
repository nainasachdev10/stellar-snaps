// =============================================================================
// Stellar Snaps SDK
// =============================================================================
// A complete SDK for building self-hosted Stellar Snaps instances.
// Create payment links, manage snaps, integrate wallets, and more.
// =============================================================================

// -----------------------------------------------------------------------------
// SNAP MANAGEMENT
// -----------------------------------------------------------------------------

// Shareable Snaps - Create snaps on Stellar Snaps servers (mirrors web app API)
export {
  createSnap,
  getSnap,
  listSnaps,
  deleteSnap,
  type CreateSnapOptions,
  type CreateSnapResult,
  type Snap,
} from './create-snap';

// Snap modal overlay - open snap URL in modal (browser only)
export {
  openSnapModal,
  closeSnapModal,
  type OpenSnapModalOptions,
} from './snap-modal';

// Snap ID Generation
export {
  generateSnapId,
  isValidSnapId,
  extractSnapId,
} from './snap-id';

// Database Schema & Types
export {
  validateSnapInput,
  createSnapObject,
  POSTGRES_SCHEMA,
  SQLITE_SCHEMA,
  type CreateSnapInput,
  type UpdateSnapInput,
} from './schema';
export type { Snap as SnapRecord } from './schema';

// -----------------------------------------------------------------------------
// SEP-0007 URIS
// -----------------------------------------------------------------------------

// Payment URIs
export {
  createPaymentSnap,
  type PaymentSnapOptions,
  type PaymentSnapResult,
} from './create-payment-snap';

// Transaction URIs
export {
  createTransactionSnap,
  type TransactionSnapOptions,
  type TransactionSnapResult,
} from './create-transaction-snap';

// URI Parsing
export { parseSnapUri, type ParsedSnap } from './parse-snap-uri';

// -----------------------------------------------------------------------------
// VALIDATION
// -----------------------------------------------------------------------------

export {
  isValidStellarAddress,
  isValidAssetCode,
  isValidAmount,
} from './validation';

// -----------------------------------------------------------------------------
// TRANSACTION BUILDING
// -----------------------------------------------------------------------------

export {
  buildPaymentTransaction,
  createAsset,
  type BuildPaymentOptions,
} from './transaction';

// -----------------------------------------------------------------------------
// FREIGHTER WALLET
// -----------------------------------------------------------------------------

export {
  connectFreighter,
  isFreighterConnected,
  getFreighterNetwork,
  signWithFreighter,
  submitTransaction,
  type FreighterConnectionResult,
  type TransactionSubmitResult,
} from './freighter';

// -----------------------------------------------------------------------------
// DISCOVERY FILES
// -----------------------------------------------------------------------------

export {
  createDiscoveryFile,
  validateDiscoveryFile,
  matchUrlToRule,
  type DiscoveryFile,
  type DiscoveryRule,
  type CreateDiscoveryFileOptions,
} from './discovery';

// -----------------------------------------------------------------------------
// URL RESOLUTION
// -----------------------------------------------------------------------------

export {
  resolveUrl,
  resolveUrls,
  isShortenerUrl,
  extractDomain,
  extractPath,
  SHORTENER_DOMAINS,
  type ResolvedUrl,
} from './url-resolver';

// -----------------------------------------------------------------------------
// DOMAIN REGISTRY
// -----------------------------------------------------------------------------

export {
  createRegistry,
  addDomain,
  removeDomain,
  getDomainStatus,
  isDomainVerified,
  isDomainBlocked,
  getVerifiedDomains,
  getBlockedDomains,
  validateRegistry,
  type Registry,
  type DomainEntry,
  type DomainStatus,
} from './registry';

// -----------------------------------------------------------------------------
// BLOCKCHAIN EXPLORER
// -----------------------------------------------------------------------------

export {
  getTransactionUrl,
  getAccountUrl,
  getAssetUrl,
  getOperationUrl,
  EXPLORER_URLS,
  type ExplorerType,
} from './explorer';

// -----------------------------------------------------------------------------
// META TAGS & SEO
// -----------------------------------------------------------------------------

export {
  generateMetaTags,
  metaTagsToHtml,
  generateJsonLd,
  type SnapMetadata,
  type MetaTags,
} from './meta-tags';

// -----------------------------------------------------------------------------
// SERVER UTILITIES
// -----------------------------------------------------------------------------

export {
  CORS_HEADERS,
  CACHE_HEADERS,
  successResponse,
  errorResponse,
  validateRequired,
  parseQueryParams,
  buildUrl,
  createRateLimiter,
  parseAddress,
  type ApiResponse,
  type RateLimitBucket,
} from './server';

// -----------------------------------------------------------------------------
// ERRORS
// -----------------------------------------------------------------------------

export {
  StellarSnapError,
  InvalidAddressError,
  InvalidAmountError,
  InvalidAssetError,
  InvalidUriError,
  SnapNotFoundError,
  SnapUnauthorizedError,
  SnapApiError,
} from './errors';

// -----------------------------------------------------------------------------
// CONSTANTS
// -----------------------------------------------------------------------------

export {
  NETWORK_PASSPHRASES,
  HORIZON_URLS,
  type Network,
  type MemoType,
} from './constants';
