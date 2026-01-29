/**
 * Snap Modal Overlay
 *
 * Opens a snap URL (e.g. from createSnap) in a modal overlay so users can pay
 * without leaving the page. Same payment UI as the web app, loaded in an iframe.
 * Browser-only; no-op in Node.
 */

const MODAL_ID = 'stellar-snap-modal';
const IFRAME_ID = 'stellar-snap-modal-iframe';

export interface OpenSnapModalOptions {
  /** Width of the iframe content area (default: 420) */
  width?: number;
  /** Height of the iframe (default: 560) */
  height?: number;
  /** Called when the user closes the modal */
  onClose?: () => void;
}

function isBrowser(): boolean {
  return typeof document !== 'undefined' && typeof window !== 'undefined';
}

/**
 * Opens a snap URL in a modal overlay (iframe). Same experience as opening
 * the link on the Stellar Snaps web app—payment form, Freighter, etc.
 * Use the URL returned from createSnap(), e.g. result.url.
 *
 * Browser-only; does nothing in Node.
 *
 * @example
 * ```typescript
 * const { url } = await createSnap({ ... });
 * openSnapModal(url, { onClose: () => console.log('Closed') });
 * ```
 */
export function openSnapModal(
  snapUrl: string,
  options: OpenSnapModalOptions = {}
): void {
  if (!isBrowser()) return;

  // Remove existing modal
  closeSnapModal();

  const { width = 420, height = 560, onClose } = options;

  const overlay = document.createElement('div');
  overlay.id = MODAL_ID;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Stellar Snap payment');

  const styles: Partial<CSSStyleDeclaration> = {
    position: 'fixed',
    inset: '0',
    zIndex: '2147483647',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: '20px',
    boxSizing: 'border-box',
  };
  Object.assign(overlay.style, styles);

  const container = document.createElement('div');
  container.style.position = 'relative';
  container.style.width = `${width}px`;
  container.style.maxWidth = '100%';
  container.style.height = `${height}px`;
  container.style.maxHeight = '90vh';
  container.style.backgroundColor = 'rgb(23, 23, 23)';
  container.style.borderRadius = '16px';
  container.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.5)';
  container.style.overflow = 'hidden';

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.textContent = '×';
  closeBtn.style.cssText =
    'position:absolute;top:12px;right:12px;z-index:10;width:32px;height:32px;border:none;border-radius:8px;background:rgba(255,255,255,0.1);color:#e5e5e5;font-size:24px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;';
  closeBtn.onclick = () => {
    closeSnapModal();
    onClose?.();
  };

  const iframe = document.createElement('iframe');
  iframe.id = IFRAME_ID;
  iframe.src = snapUrl;
  iframe.title = 'Stellar Snap payment';
  iframe.style.cssText = 'width:100%;height:100%;border:none;border-radius:16px;';

  container.appendChild(closeBtn);
  container.appendChild(iframe);
  overlay.appendChild(container);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeSnapModal();
      onClose?.();
    }
  });

  document.body.appendChild(overlay);
}

/**
 * Closes the snap modal if one is open. Safe to call anytime.
 */
export function closeSnapModal(): void {
  if (!isBrowser()) return;
  const el = document.getElementById(MODAL_ID);
  if (el) el.remove();
}
