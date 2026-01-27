/**
 * Content script - runs in ISOLATED world
<<<<<<< Updated upstream
 * 1. Injects script into main world to access Freighter
 * 2. Detects stellar-snaps URLs -> renders interactive cards
 * 3. Intercepts web+stellar: links -> calls wallet API via injected script
=======
 * Optimized for X/Twitter SPA navigation and feed detection
>>>>>>> Stashed changes
 */

const SNAP_URL_REGEX = /stellar-snaps\.vercel\.app\/s\/([a-zA-Z0-9_-]+)/;
const SNAP_URL_REGEX_LOCALHOST = /localhost:3000\/s\/([a-zA-Z0-9_-]+)/;

const NETWORK_PASSPHRASES = {
  testnet: 'Test SDF Network ; September 2015',
  public: 'Public Global Stellar Network ; September 2015',
};

const HORIZON_URLS = {
  testnet: 'https://horizon-testnet.stellar.org',
  public: 'https://horizon.stellar.org',
};

interface SnapMetadata {
  id: string;
  title: string;
  description?: string;
  destination: string;
  amount?: string;
  assetCode?: string;
  assetIssuer?: string;
  memo?: string;
  memoType?: string;
  network?: string;
}

<<<<<<< Updated upstream
// Pending Freighter requests
const pendingRequests = new Map<string, { resolve: (v: any) => void; reject: (e: Error) => void }>();
let injectedReady = false;

// Track processed elements to avoid duplicates
const processedElements = new WeakSet<Element>();
=======
// Freighter bridge
const pendingRequests = new Map<string, { resolve: (v: any) => void; reject: (e: Error) => void }>();
let injectedReady = false;

// Deduplication - track both elements AND snap IDs to prevent duplicates
const processedElements = new WeakSet<Element>();
const renderedSnapIds = new Set<string>(); // Track which snaps have cards on current page
const pendingFetches = new Set<string>(); // Prevent parallel fetches for same snap
const pendingResolves = new Set<string>();
const resolveCache = new Map<string, string>(); // t.co -> resolved URL cache

// Debounce scan
let scanTimeout: number | null = null;
const SCAN_DEBOUNCE_MS = 200;

// SPA navigation tracking
let lastUrl = location.href;
let urlCheckInterval: number | null = null;
>>>>>>> Stashed changes

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function callFreighter(method: string, params?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!injectedReady) {
      reject(new Error('Freighter bridge not ready. Please refresh the page.'));
      return;
    }

    const id = generateId();
    pendingRequests.set(id, { resolve, reject });

    window.postMessage({
      source: 'stellar-snaps-content',
      id,
      method,
      params,
    }, '*');

    setTimeout(() => {
      if (pendingRequests.has(id)) {
        pendingRequests.delete(id);
        reject(new Error('Freighter request timed out'));
      }
    }, 60000);
  });
}

window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  if (!event.data || event.data.source !== 'stellar-snaps-injected') return;

  if (event.data.ready) {
    injectedReady = true;
<<<<<<< Updated upstream
    console.log('[Stellar Snaps] Freighter bridge ready');
=======
>>>>>>> Stashed changes
    return;
  }

  const { id, result, error } = event.data;
  const pending = pendingRequests.get(id);

  if (pending) {
    pendingRequests.delete(id);
    if (error) {
      pending.reject(new Error(error));
    } else {
      pending.resolve(result);
    }
  }
});

function injectScript() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('injected.js');
  script.onload = function () {
    (this as HTMLScriptElement).remove();
  };
  (document.head || document.documentElement).appendChild(script);
}

function init() {
<<<<<<< Updated upstream
  console.log('[Stellar Snaps] Content script initializing');
  injectScript();
  document.addEventListener('click', handleLinkClick, true);
  
  // Initial scan with delay
  setTimeout(() => scanForSnapUrls(), 1000);

  // Re-scan on DOM changes (for SPAs like X)
  const observer = new MutationObserver((mutations) => {
    // Debounce: only scan if there are actual node additions
    const hasNewNodes = mutations.some(m => m.addedNodes.length > 0);
    if (hasNewNodes) {
      scanForSnapUrls();
=======
  injectScript();
  document.addEventListener('click', handleLinkClick, true);
  
  // Initial scan
  scheduleScan();

  // Watch for DOM changes with debouncing
  const observer = new MutationObserver((mutations) => {
    // Check if any mutations added nodes (not just attribute changes)
    const hasNewNodes = mutations.some(m => m.addedNodes.length > 0);
    if (hasNewNodes) {
      scheduleScan();
>>>>>>> Stashed changes
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // SPA navigation detection - X/Twitter uses History API
  // Method 1: Listen for popstate (back/forward buttons)
  window.addEventListener('popstate', () => {
    console.log('[Stellar Snaps] popstate detected');
    scheduleScan();
  });

  // Method 2: Poll for URL changes (catches pushState/replaceState)
  urlCheckInterval = window.setInterval(() => {
    if (location.href !== lastUrl) {
      console.log('[Stellar Snaps] URL changed:', lastUrl, '->', location.href);
      lastUrl = location.href;
      // Clear rendered IDs on navigation - new page may have same snap
      renderedSnapIds.clear();
      // Small delay to let new content render
      setTimeout(() => scheduleScan(), 100);
    }
  }, 500);

  // Method 3: Intercept History API (most reliable for SPAs)
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  history.pushState = function(...args) {
    originalPushState.apply(this, args);
    console.log('[Stellar Snaps] pushState detected');
    setTimeout(() => scheduleScan(), 100);
  };
  
  history.replaceState = function(...args) {
    originalReplaceState.apply(this, args);
    console.log('[Stellar Snaps] replaceState detected');
    setTimeout(() => scheduleScan(), 100);
  };

  // Also scan on scroll (for virtual scrolling like X uses)
  let lastScrollY = 0;
  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        if (Math.abs(window.scrollY - lastScrollY) > 300) {
          lastScrollY = window.scrollY;
          scheduleScan();
        }
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });

  console.log('[Stellar Snaps] Content script initialized');
}

function scheduleScan() {
  if (scanTimeout) {
    clearTimeout(scanTimeout);
  }
  scanTimeout = window.setTimeout(() => {
    scanTimeout = null;
    scanForSnapUrls();
  }, SCAN_DEBOUNCE_MS);
}

function handleLinkClick(e: MouseEvent) {
  const target = e.target as HTMLElement;
  const anchor = target.closest('a');

  if (!anchor) return;

  const href = anchor.getAttribute('href');
  if (!href) return;

  if (href.startsWith('web+stellar:')) {
    e.preventDefault();
    e.stopPropagation();
    showNotification('Processing payment...', 'info');
  }
}

<<<<<<< Updated upstream
async function handleStellarUri(uri: string) {
  try {
    const { isConnected } = await callFreighter('isConnected');
    if (!isConnected) {
      showNotification('Please connect Freighter wallet first', 'error');
      return;
    }
    showNotification('Processing payment request...', 'info');
  } catch (err: any) {
    showNotification(err?.message || 'Freighter error', 'error');
  }
}

/**
 * Extract snap ID from text content or URL
 */
function extractSnapId(text: string): { id: string; isLocalhost: boolean } | null {
  let match = text.match(SNAP_URL_REGEX);
  if (match) {
    return { id: match[1], isLocalhost: false };
  }
  
  match = text.match(SNAP_URL_REGEX_LOCALHOST);
  if (match) {
    return { id: match[1], isLocalhost: true };
  }
=======
function extractSnapId(text: string): { id: string; isLocalhost: boolean } | null {
  let match = text.match(SNAP_URL_REGEX);
  if (match) return { id: match[1], isLocalhost: false };
  
  match = text.match(SNAP_URL_REGEX_LOCALHOST);
  if (match) return { id: match[1], isLocalhost: true };
>>>>>>> Stashed changes
  
  return null;
}

function scanForSnapUrls() {
  const isX = window.location.hostname.includes('x.com') || window.location.hostname.includes('twitter.com');
  
<<<<<<< Updated upstream
  // Method 1: Direct href matching (works on most sites)
  const directLinks = document.querySelectorAll(
    'a[href*="stellar-snaps.vercel.app/s/"], a[href*="localhost:3000/s/"]'
  );
  
  directLinks.forEach((link) => {
    if (processedElements.has(link)) return;
    processedElements.add(link);
    
    const href = link.getAttribute('href') || '';
    const snapInfo = extractSnapId(href);
    if (snapInfo) {
      console.log('[Stellar Snaps] Found direct link:', snapInfo.id);
=======
  // Method 1: Direct href matching
  document.querySelectorAll('a[href*="stellar-snaps.vercel.app/s/"], a[href*="localhost:3000/s/"]').forEach((link) => {
    // Skip if inside our own card
    if (link.closest('.stellar-snap-card')) return;
    if (processedElements.has(link)) return;
    
    const href = link.getAttribute('href') || '';
    const snapInfo = extractSnapId(href);
    if (snapInfo && !renderedSnapIds.has(snapInfo.id)) {
      processedElements.add(link);
>>>>>>> Stashed changes
      const fullUrl = snapInfo.isLocalhost 
        ? `http://localhost:3000/s/${snapInfo.id}`
        : `https://stellar-snaps.vercel.app/s/${snapInfo.id}`;
      fetchAndRenderCard(link as HTMLElement, snapInfo.id, fullUrl);
    }
  });

<<<<<<< Updated upstream
  // Method 2: Check link text for our URL
  const allLinks = document.querySelectorAll('a');
  allLinks.forEach((link) => {
    if (processedElements.has(link)) return;
    
    const text = link.textContent || '';
    const href = link.getAttribute('href') || '';
    const snapInfo = extractSnapId(text) || extractSnapId(href);
    
    if (snapInfo) {
      processedElements.add(link);
      console.log('[Stellar Snaps] Found link:', snapInfo.id);
      const fullUrl = snapInfo.isLocalhost 
        ? `http://localhost:3000/s/${snapInfo.id}`
        : `https://stellar-snaps.vercel.app/s/${snapInfo.id}`;
=======
  // Method 2: Check link text (skip if we already found via href)
  document.querySelectorAll('a').forEach((link) => {
    if (link.closest('.stellar-snap-card')) return;
    if (processedElements.has(link)) return;
    
    const text = link.textContent || '';
    const snapInfo = extractSnapId(text);
    if (snapInfo && !renderedSnapIds.has(snapInfo.id)) {
      processedElements.add(link);
      const fullUrl = `https://stellar-snaps.vercel.app/s/${snapInfo.id}`;
>>>>>>> Stashed changes
      fetchAndRenderCard(link as HTMLElement, snapInfo.id, fullUrl);
    }
  });

<<<<<<< Updated upstream
  // Method 3: X/Twitter specific - find cards showing our domain and resolve t.co links
  if (isX) {
    // Find elements that mention our domain (even truncated)
    const cardWrappers = document.querySelectorAll('[data-testid="card.wrapper"]');
    
    cardWrappers.forEach((card) => {
=======
  // Method 3: X/Twitter cards with t.co links
  if (isX) {
    document.querySelectorAll('[data-testid="card.wrapper"]').forEach((card) => {
      if (card.closest('.stellar-snap-card')) return;
>>>>>>> Stashed changes
      if (processedElements.has(card)) return;
      
      const cardText = card.textContent || '';
      
<<<<<<< Updated upstream
      // Check if this card is for our domain (X truncates to just domain)
      if (cardText.includes('stellar-snaps.vercel.app') || cardText.includes('stellar-snaps')) {
        console.log('[Stellar Snaps] Found X card for our domain');
        processedElements.add(card);
        
        // Find the t.co link in this card
        const tcoLink = card.querySelector('a[href*="t.co"]') as HTMLAnchorElement;
        if (tcoLink) {
          const tcoUrl = tcoLink.getAttribute('href');
          if (tcoUrl) {
            console.log('[Stellar Snaps] Resolving t.co link:', tcoUrl);
=======
      if (cardText.includes('stellar-snaps')) {
        const tcoLink = card.querySelector('a[href*="t.co"]') as HTMLAnchorElement;
        if (tcoLink) {
          const tcoUrl = tcoLink.getAttribute('href');
          if (tcoUrl && !pendingResolves.has(tcoUrl)) {
            processedElements.add(card);
>>>>>>> Stashed changes
            resolveTcoAndRender(tcoUrl, card as HTMLElement);
          }
        }
      }
    });

<<<<<<< Updated upstream
    // Also check for links with our domain shown in text (even without full path)
    allLinks.forEach((link) => {
      if (processedElements.has(link)) return;
      
      const text = link.textContent || '';
      const href = link.getAttribute('href') || '';
      
      // If text shows our domain but we don't have the snap ID, resolve the t.co
      if ((text.includes('stellar-snaps.vercel.app') || text.includes('stellar-snaps')) 
          && !extractSnapId(text) 
          && href.includes('t.co')) {
        console.log('[Stellar Snaps] Found truncated URL, resolving:', href);
        processedElements.add(link);
        resolveTcoAndRender(href, link as HTMLElement);
=======
    // Method 4: X/Twitter tweet text containing snap URLs (for when link preview doesn't show)
    document.querySelectorAll('[data-testid="tweetText"]').forEach((tweetText) => {
      if (tweetText.closest('.stellar-snap-card')) return;
      if (processedElements.has(tweetText)) return;
      
      const text = tweetText.textContent || '';
      const snapInfo = extractSnapId(text);
      if (snapInfo && !renderedSnapIds.has(snapInfo.id)) {
        // Find the t.co link within this tweet
        const tcoLink = tweetText.querySelector('a[href*="t.co"]') as HTMLAnchorElement;
        if (tcoLink) {
          const tcoUrl = tcoLink.getAttribute('href');
          if (tcoUrl && !pendingResolves.has(tcoUrl)) {
            processedElements.add(tweetText);
            resolveTcoAndRender(tcoUrl, tweetText as HTMLElement);
          }
        }
>>>>>>> Stashed changes
      }
    });
  }
}

<<<<<<< Updated upstream
// Resolve t.co shortened URL via our server (CORS blocks direct fetch)
async function resolveTcoAndRender(tcoUrl: string, element: HTMLElement) {
  try {
    // Use our API to resolve the t.co URL (avoids CORS issues)
=======
async function resolveTcoAndRender(tcoUrl: string, element: HTMLElement) {
  // Check cache first
  if (resolveCache.has(tcoUrl)) {
    const cachedUrl = resolveCache.get(tcoUrl)!;
    const snapInfo = extractSnapId(cachedUrl);
    if (snapInfo && !renderedSnapIds.has(snapInfo.id)) {
      fetchAndRenderCard(element, snapInfo.id, cachedUrl);
    }
    return;
  }

  pendingResolves.add(tcoUrl);

  try {
>>>>>>> Stashed changes
    const response = await fetch(
      `https://stellar-snaps.vercel.app/api/resolve?url=${encodeURIComponent(tcoUrl)}`
    );
    
<<<<<<< Updated upstream
    if (!response.ok) {
      console.error('[Stellar Snaps] Resolve API error:', response.status);
      return;
    }
=======
    if (!response.ok) return;
>>>>>>> Stashed changes
    
    const data = await response.json();
    const finalUrl = data.url;
    
<<<<<<< Updated upstream
    console.log('[Stellar Snaps] Resolved to:', finalUrl);
    
    const snapInfo = extractSnapId(finalUrl);
    if (snapInfo) {
      console.log('[Stellar Snaps] Found snap ID:', snapInfo.id);
      fetchAndRenderCard(element, snapInfo.id, finalUrl);
    } else {
      console.log('[Stellar Snaps] No snap ID in resolved URL');
    }
  } catch (err) {
    console.error('[Stellar Snaps] Failed to resolve t.co:', err);
=======
    // Cache the result
    resolveCache.set(tcoUrl, finalUrl);
    
    const snapInfo = extractSnapId(finalUrl);
    if (snapInfo && !renderedSnapIds.has(snapInfo.id)) {
      fetchAndRenderCard(element, snapInfo.id, finalUrl);
    }
  } catch (err) {
    console.error('[Stellar Snaps] Resolve failed:', err);
  } finally {
    pendingResolves.delete(tcoUrl);
>>>>>>> Stashed changes
  }
}

async function fetchAndRenderCard(linkElement: HTMLElement, snapId: string, originalHref: string) {
<<<<<<< Updated upstream
=======
  // Multiple layers of deduplication
  if (renderedSnapIds.has(snapId)) return;
  if (pendingFetches.has(snapId)) return;
  if (document.querySelector(`.stellar-snap-card[data-snap-id="${snapId}"]`)) {
    renderedSnapIds.add(snapId);
    return;
  }

  pendingFetches.add(snapId);

>>>>>>> Stashed changes
  try {
    const isLocalhost = originalHref.includes('localhost');
    const baseUrl = isLocalhost ? 'http://localhost:3000' : 'https://stellar-snaps.vercel.app';

<<<<<<< Updated upstream
    console.log('[Stellar Snaps] Fetching metadata for:', snapId);
    const response = await fetch(`${baseUrl}/api/metadata/${snapId}`);
    if (!response.ok) {
      console.log('[Stellar Snaps] Metadata fetch failed:', response.status);
=======
    const response = await fetch(`${baseUrl}/api/metadata/${snapId}`);
    if (!response.ok) {
      return;
    }

    // Double-check before rendering (another request might have completed)
    if (renderedSnapIds.has(snapId)) return;
    if (document.querySelector(`.stellar-snap-card[data-snap-id="${snapId}"]`)) {
      renderedSnapIds.add(snapId);
>>>>>>> Stashed changes
      return;
    }

    const metadata: SnapMetadata = await response.json();
<<<<<<< Updated upstream
    console.log('[Stellar Snaps] Got metadata:', metadata.title);
    renderCard(linkElement, metadata, originalHref);
  } catch (err) {
    console.error('[Stellar Snaps] Failed to fetch metadata:', err);
=======
    renderCard(linkElement, metadata, originalHref);
    renderedSnapIds.add(snapId);
  } catch (err) {
    console.error('[Stellar Snaps] Failed to fetch metadata:', err);
  } finally {
    pendingFetches.delete(snapId);
>>>>>>> Stashed changes
  }
}

function renderCard(linkElement: HTMLElement, metadata: SnapMetadata, originalHref: string) {
<<<<<<< Updated upstream
  // Check if card already exists nearby
  const existingCard = linkElement.parentElement?.querySelector('.stellar-snap-card');
  if (existingCard) {
    console.log('[Stellar Snaps] Card already exists, skipping');
    return;
  }

  const card = document.createElement('div');
  card.className = 'stellar-snap-card';
=======
  // Final safety check - don't render if card already exists
  if (document.querySelector(`.stellar-snap-card[data-snap-id="${metadata.id}"]`)) return;

  const card = document.createElement('div');
  card.className = 'stellar-snap-card';
  card.setAttribute('data-snap-id', metadata.id);
>>>>>>> Stashed changes

  const hasFixedAmount = !!metadata.amount;
  const network = metadata.network || 'testnet';

  card.innerHTML = `
    <div class="snap-card-header">
      <span class="snap-card-logo">✦</span>
      <span class="snap-card-title">${escapeHtml(metadata.title)}</span>
    </div>
    ${metadata.description ? `<p class="snap-card-desc">${escapeHtml(metadata.description)}</p>` : ''}
    <div class="snap-card-amount">
<<<<<<< Updated upstream
      ${
        hasFixedAmount
          ? `<span class="snap-fixed-amount">${metadata.amount}</span>`
          : '<input type="number" placeholder="Amount" class="snap-amount-input" step="any" min="0" />'
      }
=======
      ${hasFixedAmount
        ? `<span class="snap-fixed-amount">${metadata.amount}</span>`
        : '<input type="number" placeholder="Enter amount" class="snap-amount-input" step="any" min="0" />'}
>>>>>>> Stashed changes
      <span class="snap-asset">${metadata.assetCode || 'XLM'}</span>
    </div>
    <div class="snap-card-destination">
      <span class="snap-dest-label">To:</span>
<<<<<<< Updated upstream
      <span class="snap-dest-value">${metadata.destination.slice(0, 8)}...${metadata.destination.slice(-4)}</span>
=======
      <span class="snap-dest-value">${metadata.destination.slice(0, 6)}...${metadata.destination.slice(-4)}</span>
>>>>>>> Stashed changes
    </div>
    <button class="snap-pay-btn">Pay with Stellar</button>
    <div class="snap-card-footer">
      <span class="snap-network-badge">${network}</span>
<<<<<<< Updated upstream
      <a href="${originalHref}" target="_blank" class="snap-view-link">Open</a>
    </div>
    <div class="snap-status" style="display: none;"></div>
  `;

  // Insert after the link element
=======
      <a href="${originalHref}" target="_blank" class="snap-view-link">View</a>
    </div>
    <div class="snap-status"></div>
  `;

>>>>>>> Stashed changes
  linkElement.parentNode?.insertBefore(card, linkElement.nextSibling);
  console.log('[Stellar Snaps] Card rendered');

<<<<<<< Updated upstream
=======
  setupPayButton(card, metadata, originalHref, network);
}

function setupPayButton(card: HTMLElement, metadata: SnapMetadata, originalHref: string, network: string) {
>>>>>>> Stashed changes
  const payBtn = card.querySelector('.snap-pay-btn') as HTMLButtonElement;
  const statusEl = card.querySelector('.snap-status') as HTMLDivElement;

  payBtn?.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const amountInput = card.querySelector('.snap-amount-input') as HTMLInputElement;
    const amount = amountInput?.value || metadata.amount;

    if (!amount || parseFloat(amount) <= 0) {
<<<<<<< Updated upstream
      updateCardStatus(statusEl, 'Please enter a valid amount', 'error');
=======
      showStatus(statusEl, 'Enter a valid amount', 'error');
>>>>>>> Stashed changes
      return;
    }

    payBtn.disabled = true;
    payBtn.textContent = 'Connecting...';
<<<<<<< Updated upstream
    updateCardStatus(statusEl, '', '');

    try {
      const { isConnected } = await callFreighter('isConnected');
      if (!isConnected) {
        throw new Error('Freighter not connected. Click the Freighter icon to connect.');
      }

      const { isAllowed } = await callFreighter('isAllowed');
      if (!isAllowed) {
        await callFreighter('setAllowed');
      }

      const { address } = await callFreighter('getAddress');
      if (!address) {
        throw new Error('Please connect your wallet in Freighter');
      }

      const networkPassphrase = NETWORK_PASSPHRASES[network as keyof typeof NETWORK_PASSPHRASES];
      const { networkPassphrase: currentNetwork } = await callFreighter('getNetwork');

      if (currentNetwork !== networkPassphrase) {
        throw new Error(`Please switch Freighter to ${network}`);
      }

      payBtn.textContent = 'Building tx...';

      const horizonUrl = HORIZON_URLS[network as keyof typeof HORIZON_URLS];
      const accountResponse = await fetch(`${horizonUrl}/accounts/${address}`);

      if (!accountResponse.ok) {
        if (accountResponse.status === 404) {
          throw new Error('Account not funded. Get testnet XLM from friendbot.');
        }
        throw new Error('Failed to load account');
      }

      const account = await accountResponse.json();

      const isLocalhost = originalHref.includes('localhost');
      const baseUrl = isLocalhost ? 'http://localhost:3000' : 'https://stellar-snaps.vercel.app';

      const buildResponse = await fetch(`${baseUrl}/api/build-tx`, {
=======
    showStatus(statusEl, '', '');

    try {
      const { isConnected } = await callFreighter('isConnected');
      if (!isConnected) throw new Error('Connect Freighter first');

      const { isAllowed } = await callFreighter('isAllowed');
      if (!isAllowed) await callFreighter('setAllowed');

      const { address } = await callFreighter('getAddress');
      if (!address) throw new Error('Connect wallet in Freighter');

      const networkPassphrase = NETWORK_PASSPHRASES[network as keyof typeof NETWORK_PASSPHRASES];
      const { networkPassphrase: currentNetwork } = await callFreighter('getNetwork');
      if (currentNetwork !== networkPassphrase) throw new Error(`Switch Freighter to ${network}`);

      payBtn.textContent = 'Building...';

      const horizonUrl = HORIZON_URLS[network as keyof typeof HORIZON_URLS];
      const accountRes = await fetch(`${horizonUrl}/accounts/${address}`);
      if (!accountRes.ok) throw new Error(accountRes.status === 404 ? 'Account not funded' : 'Failed to load account');

      const account = await accountRes.json();
      const baseUrl = originalHref.includes('localhost') ? 'http://localhost:3000' : 'https://stellar-snaps.vercel.app';

      const buildRes = await fetch(`${baseUrl}/api/build-tx`, {
>>>>>>> Stashed changes
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: address,
          sequence: account.sequence,
          destination: metadata.destination,
          amount,
          assetCode: metadata.assetCode,
          assetIssuer: metadata.assetIssuer,
          memo: metadata.memo,
          memoType: metadata.memoType,
          network,
        }),
      });

<<<<<<< Updated upstream
      if (!buildResponse.ok) {
        const err = await buildResponse.json();
        throw new Error(err?.error || 'Failed to build transaction');
      }

      const { xdr } = await buildResponse.json();

      payBtn.textContent = 'Sign in wallet...';

      const { signedTxXdr } = await callFreighter('signTransaction', {
        xdr,
        networkPassphrase,
      });

      payBtn.textContent = 'Submitting...';

      const submitResponse = await fetch(`${horizonUrl}/transactions`, {
=======
      if (!buildRes.ok) throw new Error('Failed to build tx');
      const { xdr } = await buildRes.json();

      payBtn.textContent = 'Sign...';
      const { signedTxXdr } = await callFreighter('signTransaction', { xdr, networkPassphrase });

      payBtn.textContent = 'Submitting...';
      const submitRes = await fetch(`${horizonUrl}/transactions`, {
>>>>>>> Stashed changes
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `tx=${encodeURIComponent(signedTxXdr)}`,
      });

<<<<<<< Updated upstream
      const result = await submitResponse.json();

      if (submitResponse.ok) {
        payBtn.textContent = 'Paid!';
        payBtn.className = 'snap-pay-btn snap-pay-success';
        updateCardStatus(statusEl, `Success! TX: ${result.hash.slice(0, 8)}...`, 'success');
      } else {
        const errorMessage = result?.extras?.result_codes?.transaction || 'Transaction failed';
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      console.error('[Stellar Snaps] Payment error:', err);
      payBtn.disabled = false;
      payBtn.textContent = 'Try Again';

      if (err?.message?.includes('User declined') || err?.message?.includes('cancelled')) {
        updateCardStatus(statusEl, 'Cancelled', 'info');
      } else {
        updateCardStatus(statusEl, err?.message || 'Payment failed', 'error');
      }
=======
      const result = await submitRes.json();
      if (submitRes.ok) {
        payBtn.textContent = 'Paid!';
        payBtn.className = 'snap-pay-btn snap-pay-success';
        showStatus(statusEl, `TX: ${result.hash.slice(0, 8)}...`, 'success');
      } else {
        throw new Error(result?.extras?.result_codes?.transaction || 'Failed');
      }
    } catch (err: any) {
      payBtn.disabled = false;
      payBtn.textContent = 'Try Again';
      showStatus(statusEl, err?.message || 'Payment failed', 'error');
>>>>>>> Stashed changes
    }
  });
}

<<<<<<< Updated upstream
function updateCardStatus(statusEl: HTMLDivElement, message: string, type: string) {
  if (!message) {
    statusEl.style.display = 'none';
    return;
  }
  statusEl.style.display = 'block';
  statusEl.textContent = message;
  statusEl.className = `snap-status snap-status-${type}`;
=======
function showStatus(el: HTMLElement, msg: string, type: string) {
  el.textContent = msg;
  el.className = `snap-status ${type ? `snap-status-${type}` : ''}`;
  el.style.display = msg ? 'block' : 'none';
>>>>>>> Stashed changes
}

function showNotification(message: string, type: 'info' | 'success' | 'error') {
  document.querySelector('.stellar-snap-notification')?.remove();
<<<<<<< Updated upstream

  const notification = document.createElement('div');
  notification.className = `stellar-snap-notification snap-notif-${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => notification.remove(), 4000);
=======
  const el = document.createElement('div');
  el.className = `stellar-snap-notification snap-notif-${type}`;
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
>>>>>>> Stashed changes
}

function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
