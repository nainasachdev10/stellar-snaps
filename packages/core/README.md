# @stellar-snaps/sdk

A complete SDK for building on Stellar Snaps technology. Create shareable payment links, build transactions, integrate wallets, and host your own snap endpoints.

## What is Stellar Snaps?

Stellar Snaps lets you create shareable payment links for the Stellar blockchain - like Venmo/PayPal request links, but for crypto. Share links on Twitter, Discord, or your website, and recipients can pay with one click using their Freighter wallet.

## Installation

```bash
npm install @stellar-snaps/sdk
# or
pnpm add @stellar-snaps/sdk
```

**Peer dependencies** (install if you use transaction building or Freighter):  
`@stellar/freighter-api`, `@stellar/stellar-sdk`

## How it works

- **Shareable Snap API** (`createSnap`, `getSnap`, `listSnaps`, `deleteSnap`)  
  Calls the Stellar Snaps web app at `https://stellar-snaps.vercel.app` by default. Snaps are stored there; you get back shareable URLs (e.g. `https://stellar-snaps.vercel.app/s/abc123`). Works in **Node.js** and **browser** (CORS is enabled on the API). Use `baseUrl` to point at your own deployment.

- **SEP-0007 URIs** (`createPaymentSnap`, `createTransactionSnap`, `parseSnapUri`)  
  Pure logic, no network. Build or parse `web+stellar:...` payment/transaction links.

- **Transactions & Freighter** (`buildPaymentTransaction`, `signWithFreighter`, `submitTransaction`, etc.)  
  Run in a **browser** with the [Freighter](https://www.freighter.app/) extension installed. Uses `@stellar/freighter-api` and `@stellar/stellar-sdk`.

So: install the package, use the Shareable Snap API from any environment; use Freighter-related APIs only in a browser with Freighter installed.

## Quick Start

### 1. Create a Payment Link

```typescript
import { createPaymentSnap } from '@stellar-snaps/sdk';

const { uri } = createPaymentSnap({
  destination: 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOUJ3DTJE4QRK764',
  amount: '10',
  assetCode: 'USDC',
  assetIssuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
  memo: 'Coffee payment',
  network: 'public',
});

console.log(uri);
// => web+stellar:pay?destination=GDQP2K...&amount=10&asset_code=USDC&...
```

### 2. Parse a Payment Link

```typescript
import { parseSnapUri } from '@stellar-snaps/sdk';

const parsed = parseSnapUri('web+stellar:pay?destination=GDQP2K...&amount=10');

console.log(parsed);
// => { type: 'pay', destination: 'GDQP2K...', amount: '10', ... }
```

### 3. Build and Sign a Transaction

```typescript
import {
  connectFreighter,
  buildPaymentTransaction,
  signWithFreighter,
  submitTransaction,
} from '@stellar-snaps/sdk';

// Connect to user's wallet
const { publicKey, network } = await connectFreighter();

// Build the transaction
const xdr = buildPaymentTransaction({
  source: publicKey,
  sequence: '123456789', // Get from Horizon API
  destination: 'GBZX...',
  amount: '10',
  asset: { code: 'XLM' },
  network: 'public',
});

// Sign with Freighter (opens popup)
const signedXdr = await signWithFreighter(xdr, 'public');

// Submit to Stellar network
const result = await submitTransaction(signedXdr, 'public');

if (result.successful) {
  console.log(`Success! Hash: ${result.hash}`);
}
```

### 4. Create Shareable Snaps (Web App API)

Create, fetch, list, and delete database-backed snaps—same behavior as the web dashboard. Uses `https://stellar-snaps.vercel.app` by default.

```typescript
import { createSnap, getSnap, listSnaps, deleteSnap } from '@stellar-snaps/sdk';

// Create a snap (stores on server, returns shareable URL)
const { url, snap } = await createSnap({
  creator: 'GCNZMNUTQ5UMQ5QL0FUAW3CUADWB...',
  title: 'Buy me a coffee',
  destination: 'GCNZMNUTQ5UMQ5QL0FUAW3CUADWB...',
  amount: '5',
  network: 'testnet',
});
console.log(url);
// => https://stellar-snaps.vercel.app/s/u8oYHLhl

// Fetch a snap by ID
const fetchedSnap = await getSnap('u8oYHLhl');

// List all snaps for a creator
const snaps = await listSnaps('GCNZMNUTQ5UMQ5QL0FUAW3CUADWB...');

// Delete a snap (requires creator address)
await deleteSnap('u8oYHLhl', 'GCNZMNUTQ5UMQ5QL0FUAW3CUADWB...');
```

Use `baseUrl` to point at your own Stellar Snaps instance:

```typescript
const { url } = await createSnap({
  creator: 'G...',
  title: 'Test',
  destination: 'G...',
  baseUrl: 'https://your-stellar-snaps.vercel.app',
});
```

**Show the same modal overlay as the web app** (browser only): open the snap URL in a modal so users can pay without leaving your page:

```typescript
import { createSnap, openSnapModal, closeSnapModal } from '@stellar-snaps/sdk';

const { url } = await createSnap({ creator: 'G...', title: 'Tip', destination: 'G...' });
openSnapModal(url, {
  width: 420,
  height: 560,
  onClose: () => console.log('Modal closed'),
});
// User sees the same payment UI as stellar-snaps.vercel.app/s/xxx in an overlay
```

### 5. Host Your Own Snap Endpoints

Create a discovery file to enable the browser extension to find your snaps:

```typescript
import { createDiscoveryFile } from '@stellar-snaps/sdk';

const discovery = createDiscoveryFile({
  name: 'My Payment App',
  description: 'Accept Stellar payments',
  rules: [
    { pathPattern: '/pay/*', apiPath: '/api/snap/$1' },
  ],
});

// Save as: public/.well-known/stellar-snap.json
```

## API Reference

### Shareable Snap API (Web App)

These functions mirror the Stellar Snaps web app API. Use them to create and manage snaps that are stored on a server and get shareable URLs.

#### `createSnap(options)`

Creates a snap on the server and returns the shareable URL.

```typescript
interface CreateSnapOptions {
  creator: string;              // Creator's Stellar address (required)
  title: string;                // Display title (required)
  destination: string;          // Payment destination (required)
  description?: string;
  amount?: string;              // Omit for open amount
  assetCode?: string;           // Default: 'XLM'
  assetIssuer?: string;         // Required for non-XLM
  memo?: string;
  memoType?: MemoType;
  network?: 'public' | 'testnet'; // Default: 'testnet'
  imageUrl?: string;
  baseUrl?: string;             // Default: 'https://stellar-snaps.vercel.app'
}

interface CreateSnapResult {
  id: string;
  url: string;                  // Full shareable URL
  snap: Snap;
}
```

#### `getSnap(id, options?)`

Fetches a snap by ID. Uses `GET /api/snap/[id]`.

- **Throws** `SnapNotFoundError` if the snap does not exist.
- **Throws** `SnapApiError` on other API errors.

#### `listSnaps(creator, options?)`

Lists all snaps for a creator. Uses `GET /api/snaps?creator=...`.

#### `deleteSnap(id, creator, options?)`

Deletes a snap. Requires the creator's address (ownership). Uses `DELETE /api/snaps?id=...&creator=...`.

- **Throws** `SnapNotFoundError` if the snap does not exist.
- **Throws** `SnapUnauthorizedError` if the creator does not own the snap.
- **Throws** `SnapApiError` on other API errors.

#### `Snap` type

```typescript
interface Snap {
  id: string;
  creator?: string;             // Omitted in GET /api/snap/[id] response
  title: string;
  description?: string | null;
  destination: string;
  amount?: string | null;
  assetCode: string;
  assetIssuer?: string | null;
  memo?: string | null;
  memoType?: string;
  network: string;
  imageUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
```

#### `openSnapModal(snapUrl, options?)`

Opens a snap URL in a full-screen modal overlay (iframe). Same payment UI as opening the link on the Stellar Snaps web app. **Browser only**; no-op in Node.

```typescript
interface OpenSnapModalOptions {
  width?: number;   // Default: 420
  height?: number;  // Default: 560
  onClose?: () => void;
}
```

#### `closeSnapModal()`

Closes the snap modal if one is open. Safe to call anytime.

### SEP-0007 URI Functions

#### `createPaymentSnap(options)`

Creates a SEP-0007 payment URI.

```typescript
interface PaymentSnapOptions {
  destination: string;          // Recipient's Stellar address
  amount?: string;              // Amount to send
  assetCode?: string;           // Asset code (default: XLM)
  assetIssuer?: string;         // Asset issuer (required for non-XLM)
  memo?: string;                // Transaction memo
  memoType?: MemoType;          // Memo type (default: MEMO_TEXT)
  message?: string;             // Human-readable message (max 300 chars)
  network?: 'public' | 'testnet';
  callback?: string;            // Callback URL after signing
}
```

#### `createTransactionSnap(options)`

Creates a SEP-0007 transaction URI for arbitrary transactions.

```typescript
interface TransactionSnapOptions {
  xdr: string;                  // Transaction XDR
  network?: 'public' | 'testnet';
  message?: string;             // Human-readable message
  callback?: string;            // Callback URL
  pubkey?: string;              // Required signer's public key
}
```

#### `parseSnapUri(uri)`

Parses a SEP-0007 URI back into an object.

```typescript
const parsed = parseSnapUri('web+stellar:pay?destination=G...');
// => { type: 'pay', destination: 'G...', ... }
```

### Validation Functions

#### `isValidStellarAddress(address)`

Returns `true` if the address is a valid Stellar public key (56 chars, starts with 'G').

#### `isValidAssetCode(code)`

Returns `true` if the code is a valid asset code (1-12 alphanumeric chars).

#### `isValidAmount(amount)`

Returns `true` if the amount is a positive number string.

### Transaction Building

#### `buildPaymentTransaction(options)`

Builds a Stellar payment transaction and returns the XDR.

```typescript
interface BuildPaymentOptions {
  source: string;               // Payer's address
  sequence: string;             // Account sequence number
  destination: string;          // Recipient's address
  amount: string;               // Amount to send
  asset?: {
    code: string;
    issuer?: string;
  };
  memo?: {
    type: MemoType;
    value: string;
  };
  network: 'public' | 'testnet';
  timeout?: number;             // Default: 180 seconds
}
```

#### `createAsset(code, issuer?)`

Creates a Stellar Asset object.

```typescript
const xlm = createAsset('XLM');
const usdc = createAsset('USDC', 'GA5ZS...');
```

### Freighter Wallet Integration

#### `connectFreighter()`

Connects to Freighter wallet and returns the user's public key and network.

```typescript
const { publicKey, network } = await connectFreighter();
```

#### `isFreighterConnected()`

Returns `true` if Freighter is installed and the user has granted access.

#### `getFreighterNetwork()`

Returns the current network from Freighter ('public' or 'testnet').

#### `signWithFreighter(xdr, network)`

Signs a transaction XDR using Freighter. Opens a popup for user approval.

#### `submitTransaction(signedXdr, network)`

Submits a signed transaction to the Stellar network.

```typescript
const result = await submitTransaction(signedXdr, 'public');
// => { hash: 'abc...', successful: true, ledger: 12345 }
```

### Discovery Files

#### `createDiscoveryFile(options)`

Creates a discovery file object for hosting at `/.well-known/stellar-snap.json`.

```typescript
interface CreateDiscoveryFileOptions {
  name: string;
  description?: string;
  icon?: string;
  rules: Array<{
    pathPattern: string;    // URL pattern, e.g., "/pay/*"
    apiPath: string;        // API path, e.g., "/api/snap/$1"
  }>;
}
```

#### `validateDiscoveryFile(file)`

Type guard that validates if an object is a valid discovery file.

#### `matchUrlToRule(pathname, rules)`

Matches a URL path against rules and returns the API path.

```typescript
matchUrlToRule('/pay/abc123', rules);
// => '/api/snap/abc123'
```

### Error Classes

All errors extend `StellarSnapError` with a `code` property for programmatic handling:

- `InvalidAddressError` - Invalid Stellar address
- `InvalidAmountError` - Invalid amount
- `InvalidAssetError` - Invalid asset configuration
- `InvalidUriError` - Invalid SEP-0007 URI
- `SnapNotFoundError` - Snap not found (404 from API)
- `SnapUnauthorizedError` - Not authorized to perform action (e.g. delete another user's snap)
- `SnapApiError` - Stellar Snaps API returned an error (includes optional `statusCode`)

```typescript
try {
  createPaymentSnap({ destination: 'invalid' });
} catch (error) {
  if (error instanceof InvalidAddressError) {
    console.log(error.code); // 'INVALID_ADDRESS'
  }
}

try {
  const snap = await getSnap('missing-id');
} catch (error) {
  if (error instanceof SnapNotFoundError) {
    console.log(error.code); // 'SNAP_NOT_FOUND'
  }
}
```

### Constants

```typescript
import { NETWORK_PASSPHRASES, HORIZON_URLS } from '@stellar-snaps/sdk';

NETWORK_PASSPHRASES.public;  // 'Public Global Stellar Network ; September 2015'
NETWORK_PASSPHRASES.testnet; // 'Test SDF Network ; September 2015'

HORIZON_URLS.public;  // 'https://horizon.stellar.org'
HORIZON_URLS.testnet; // 'https://horizon-testnet.stellar.org'
```

### Types

```typescript
type Network = 'public' | 'testnet';
type MemoType = 'MEMO_TEXT' | 'MEMO_ID' | 'MEMO_HASH' | 'MEMO_RETURN';
```

## License

MIT
