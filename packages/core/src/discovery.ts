/**
 * A rule for matching URL paths to API endpoints.
 */
export interface DiscoveryRule {
  /**
   * URL path pattern with wildcards.
   * Use `*` as a wildcard that matches any characters.
   *
   * @example "/s/*" matches "/s/abc123"
   * @example "/pay/*" matches "/pay/user123"
   */
  pathPattern: string;

  /**
   * API endpoint path template.
   * Use `$1`, `$2`, etc. to insert captured wildcards.
   *
   * @example "/api/snap/$1" with pathPattern "/s/*" and URL "/s/abc"
   *          resolves to "/api/snap/abc"
   */
  apiPath: string;
}

/**
 * Discovery file structure for Stellar Snaps.
 *
 * This file should be hosted at `/.well-known/stellar-snap.json` on your domain
 * to enable the browser extension to discover and render your snaps.
 */
export interface DiscoveryFile {
  /** The name of your application */
  name: string;

  /** A short description of your application */
  description?: string;

  /** URL to your application's icon (recommended: 128x128 PNG) */
  icon?: string;

  /** Rules for matching URLs to snap metadata endpoints */
  rules: DiscoveryRule[];
}

/**
 * Options for creating a discovery file.
 */
export interface CreateDiscoveryFileOptions {
  /** The name of your application */
  name: string;
  /** A short description of your application */
  description?: string;
  /** URL to your application's icon */
  icon?: string;
  /** Rules for matching URLs to snap metadata endpoints */
  rules: DiscoveryRule[];
}

/**
 * Creates a valid discovery file object.
 *
 * Use this to generate the JSON that should be hosted at
 * `/.well-known/stellar-snap.json` on your domain.
 *
 * @param options - The discovery file configuration
 * @returns A valid DiscoveryFile object
 *
 * @example
 * ```typescript
 * const discovery = createDiscoveryFile({
 *   name: 'My Payment App',
 *   description: 'Accept Stellar payments easily',
 *   rules: [
 *     { pathPattern: '/pay/*', apiPath: '/api/snap/$1' },
 *     { pathPattern: '/donate/*', apiPath: '/api/donation/$1' },
 *   ],
 * });
 *
 * // Save as /.well-known/stellar-snap.json
 * fs.writeFileSync(
 *   'public/.well-known/stellar-snap.json',
 *   JSON.stringify(discovery, null, 2)
 * );
 * ```
 */
export function createDiscoveryFile(options: CreateDiscoveryFileOptions): DiscoveryFile {
  const { name, description, icon, rules } = options;

  if (!name || typeof name !== 'string') {
    throw new Error('Discovery file requires a name');
  }

  if (!rules || !Array.isArray(rules) || rules.length === 0) {
    throw new Error('Discovery file requires at least one rule');
  }

  // Validate rules
  for (const rule of rules) {
    if (!rule.pathPattern || typeof rule.pathPattern !== 'string') {
      throw new Error('Each rule requires a pathPattern');
    }
    if (!rule.apiPath || typeof rule.apiPath !== 'string') {
      throw new Error('Each rule requires an apiPath');
    }
  }

  const discoveryFile: DiscoveryFile = {
    name,
    rules,
  };

  if (description) {
    discoveryFile.description = description;
  }

  if (icon) {
    discoveryFile.icon = icon;
  }

  return discoveryFile;
}

/**
 * Validates that an unknown object is a valid discovery file.
 *
 * Use this to validate discovery files fetched from other domains.
 *
 * @param file - The object to validate
 * @returns true if the object is a valid DiscoveryFile
 *
 * @example
 * ```typescript
 * const response = await fetch('https://example.com/.well-known/stellar-snap.json');
 * const data = await response.json();
 *
 * if (validateDiscoveryFile(data)) {
 *   console.log('Valid discovery file:', data.name);
 * } else {
 *   console.error('Invalid discovery file');
 * }
 * ```
 */
export function validateDiscoveryFile(file: unknown): file is DiscoveryFile {
  if (!file || typeof file !== 'object') {
    return false;
  }

  const obj = file as Record<string, unknown>;

  // Check required fields
  if (typeof obj.name !== 'string' || !obj.name) {
    return false;
  }

  if (!Array.isArray(obj.rules) || obj.rules.length === 0) {
    return false;
  }

  // Validate each rule
  for (const rule of obj.rules) {
    if (!rule || typeof rule !== 'object') {
      return false;
    }
    const ruleObj = rule as Record<string, unknown>;
    if (typeof ruleObj.pathPattern !== 'string' || !ruleObj.pathPattern) {
      return false;
    }
    if (typeof ruleObj.apiPath !== 'string' || !ruleObj.apiPath) {
      return false;
    }
  }

  // Optional fields should be correct types if present
  if (obj.description !== undefined && typeof obj.description !== 'string') {
    return false;
  }

  if (obj.icon !== undefined && typeof obj.icon !== 'string') {
    return false;
  }

  return true;
}

/**
 * Matches a URL pathname against discovery rules and returns the API path.
 *
 * This is used to find which API endpoint to call for a given URL.
 *
 * @param pathname - The URL pathname to match (e.g., "/s/abc123")
 * @param rules - The discovery rules to match against
 * @returns The resolved API path, or null if no match
 *
 * @example
 * ```typescript
 * const rules = [
 *   { pathPattern: '/s/*', apiPath: '/api/snap/$1' },
 *   { pathPattern: '/pay/*', apiPath: '/api/payment/$1' },
 * ];
 *
 * matchUrlToRule('/s/abc123', rules);
 * // => '/api/snap/abc123'
 *
 * matchUrlToRule('/pay/user456', rules);
 * // => '/api/payment/user456'
 *
 * matchUrlToRule('/unknown/path', rules);
 * // => null
 * ```
 */
export function matchUrlToRule(
  pathname: string,
  rules: DiscoveryRule[]
): string | null {
  for (const rule of rules) {
    // Convert pathPattern to regex
    // "/s/*" becomes /^\/s\/(.+)$/
    const pattern = rule.pathPattern
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape special regex chars
      .replace(/\\\*/g, '(.+)'); // Convert \* back to capture group

    const regex = new RegExp(`^${pattern}$`);
    const match = pathname.match(regex);

    if (match) {
      // Replace $1, $2, etc. with captured groups
      let apiPath = rule.apiPath;
      for (let i = 1; i < match.length; i++) {
        const captured = match[i];
        if (captured !== undefined) {
          apiPath = apiPath.replace(`$${i}`, captured);
        }
      }
      return apiPath;
    }
  }

  return null;
}
