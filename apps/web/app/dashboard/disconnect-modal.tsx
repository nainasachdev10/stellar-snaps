'use client';

type DisconnectModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function DisconnectModal({
  open,
  onClose,
  onConfirm,
}: DisconnectModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="disconnect-modal-title"
    >
      <div
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="disconnect-modal-title"
          className="text-lg font-bold text-gray-900 mb-2"
        >
          Disconnect wallet?
        </h2>
        <p className="text-gray-600 text-sm mb-6">
          You will need to connect again to create or manage snaps.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
}
