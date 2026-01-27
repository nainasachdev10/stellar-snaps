'use client';

import { useState } from 'react';

type DashboardHeaderProps = {
  address: string;
  onDisconnectClick: () => void;
};

export function DashboardHeader({ address, onDisconnectClick }: DashboardHeaderProps) {
  const [addressCopied, setAddressCopied] = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setAddressCopied(true);
    setTimeout(() => setAddressCopied(false), 2000);
  };

  return (
    <header className="mb-8 md:mb-10">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-3 md:px-6 md:py-3.5 h-14 md:h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl text-purple-500" aria-hidden>
            ✦
          </span>
          <h1 className="text-base md:text-lg font-bold text-gray-900 tracking-tight">
            Stellar Snaps
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyAddress}
            className="bg-gray-100 text-gray-600 text-xs font-mono px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
            title="Click to copy address"
          >
            {addressCopied ? 'Copied!' : `${address.slice(0, 4)}...${address.slice(-4)}`}
          </button>
          <button
            type="button"
            onClick={onDisconnectClick}
            className="bg-white border border-gray-200 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
          >
            Disconnect
          </button>
        </div>
      </div>
    </header>
  );
}
