/**
 * Domain Registry
 *
 * Manages trusted/verified domains for snap hosting.
 */

export type DomainStatus = 'verified' | 'unverified' | 'blocked';

export interface DomainEntry {
  /** The domain name */
  domain: string;
  /** Trust status */
  status: DomainStatus;
  /** Optional display name */
  name?: string;
  /** Optional description */
  description?: string;
  /** When the domain was added */
  addedAt?: string;
  /** When the domain was last verified */
  verifiedAt?: string;
}

export interface Registry {
  /** List of all domain entries */
  domains: DomainEntry[];
  /** When the registry was last updated */
  updatedAt: string;
  /** Registry version */
  version: string;
}

/**
 * Creates a new registry.
 *
 * @example
 * ```typescript
 * const registry = createRegistry([
 *   { domain: 'stellarsnaps.com', status: 'verified', name: 'Stellar Snaps' },
 *   { domain: 'example.com', status: 'unverified' },
 * ]);
 * ```
 */
export function createRegistry(domains: DomainEntry[] = []): Registry {
  return {
    domains,
    updatedAt: new Date().toISOString(),
    version: '1.0.0',
  };
}

/**
 * Adds a domain to the registry.
 */
export function addDomain(registry: Registry, entry: DomainEntry): Registry {
  const existing = registry.domains.findIndex((d) => d.domain === entry.domain);

  const newDomains =
    existing >= 0
      ? registry.domains.map((d, i) => (i === existing ? entry : d))
      : [...registry.domains, entry];

  return {
    ...registry,
    domains: newDomains,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Removes a domain from the registry.
 */
export function removeDomain(registry: Registry, domain: string): Registry {
  return {
    ...registry,
    domains: registry.domains.filter((d) => d.domain !== domain),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Gets the status of a domain.
 *
 * @example
 * ```typescript
 * const status = getDomainStatus(registry, 'stellarsnaps.com');
 * // { domain: 'stellarsnaps.com', status: 'verified', ... }
 * ```
 */
export function getDomainStatus(
  registry: Registry,
  domain: string
): DomainEntry | null {
  // Normalize domain
  const normalizedDomain = domain.toLowerCase().replace(/^www\./, '');

  // Check exact match
  const entry = registry.domains.find(
    (d) => d.domain.toLowerCase() === normalizedDomain
  );

  return entry || null;
}

/**
 * Checks if a domain is verified.
 */
export function isDomainVerified(registry: Registry, domain: string): boolean {
  const entry = getDomainStatus(registry, domain);
  return entry?.status === 'verified';
}

/**
 * Checks if a domain is blocked.
 */
export function isDomainBlocked(registry: Registry, domain: string): boolean {
  const entry = getDomainStatus(registry, domain);
  return entry?.status === 'blocked';
}

/**
 * Gets all verified domains.
 */
export function getVerifiedDomains(registry: Registry): DomainEntry[] {
  return registry.domains.filter((d) => d.status === 'verified');
}

/**
 * Gets all blocked domains.
 */
export function getBlockedDomains(registry: Registry): DomainEntry[] {
  return registry.domains.filter((d) => d.status === 'blocked');
}

/**
 * Validates a registry object.
 */
export function validateRegistry(registry: unknown): registry is Registry {
  if (!registry || typeof registry !== 'object') return false;

  const r = registry as Record<string, unknown>;

  if (!Array.isArray(r.domains)) return false;
  if (typeof r.updatedAt !== 'string') return false;
  if (typeof r.version !== 'string') return false;

  return r.domains.every((d: unknown) => {
    if (!d || typeof d !== 'object') return false;
    const entry = d as Record<string, unknown>;
    return (
      typeof entry.domain === 'string' &&
      ['verified', 'unverified', 'blocked'].includes(entry.status as string)
    );
  });
}
