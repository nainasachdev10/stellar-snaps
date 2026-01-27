'use client';

type ConnectWalletViewProps = {
  onConnect: () => void;
  isConnecting: boolean;
  error: string;
};

export function ConnectWalletView({
  onConnect,
  isConnecting,
  error,
}: ConnectWalletViewProps) {
  return (
    <div className="min-h-screen bg-[#f9f7fa] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10 max-w-md w-full text-center">
        <span className="text-4xl mb-6 block text-purple-500" aria-hidden>
          ✦
        </span>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          Stellar Snaps
        </h1>
        <p className="text-gray-600 mb-8 text-sm md:text-base">
          Connect your wallet to create shareable payment links
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <button
          type="button"
          onClick={onConnect}
          disabled={isConnecting}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3.5 px-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md"
        >
          {isConnecting ? 'Connecting...' : 'Connect Freighter'}
        </button>

        <p className="text-gray-500 text-sm mt-6">
          Don&apos;t have Freighter?{' '}
          <a
            href="https://freighter.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 hover:underline font-medium"
          >
            Get it here
          </a>
        </p>
      </div>
    </div>
  );
}
