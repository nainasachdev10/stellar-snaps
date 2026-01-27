'use client';

import { useState, useEffect } from 'react';

type Snap = {
  id: string;
  title: string;
  destination: string;
  amount: string | null;
  assetCode: string | null;
  createdAt: string;
};

type Props = {
  creator: string;
  refreshKey: number;
};

export default function SnapsList({ creator, refreshKey }: Props) {
  const [snaps, setSnaps] = useState<Snap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSnaps();
  }, [creator, refreshKey]);

  const fetchSnaps = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/snaps?creator=${encodeURIComponent(creator)}`);
      if (res.ok) {
        const data = await res.json();
        setSnaps(data);
      }
    } catch (err) {
      console.error('Failed to fetch snaps:', err);
    }
    setLoading(false);
  };

  const deleteSnap = async (id: string) => {
    if (!confirm('Delete this snap?')) return;

    try {
      const res = await fetch(`/api/snaps?id=${id}&creator=${encodeURIComponent(creator)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSnaps(snaps.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete snap:', err);
    }
  };

  const copyLink = (id: string) => {
    const url = `${window.location.origin}/s/${id}`;
    navigator.clipboard.writeText(url);
  };

  const cardBase =
    'bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8';

  if (loading) {
    return (
      <div className={cardBase}>
        <h2 className="text-lg font-bold text-gray-900 mb-6">Your Snaps</h2>
        <p className="text-gray-500 text-center text-sm">Loading...</p>
      </div>
    );
  }

  if (snaps.length === 0) {
    return (
      <div className={cardBase}>
        <h2 className="text-lg font-bold text-gray-900 mb-6">Your Snaps</h2>
        <p className="text-gray-500 text-center text-sm">No snaps yet. Create your first one!</p>
      </div>
    );
  }

  return (
    <div className={cardBase}>
      {/* Title inside card – bold, dark, like reference */}
      <h2 className="text-lg font-bold text-gray-900 mb-6">Your Snaps</h2>
      <div className="space-y-3">
        {snaps.map((snap) => (
          <div
            key={snap.id}
            className="bg-gray-50 rounded-xl border border-gray-100 p-4 flex items-start justify-between gap-4"
          >
            <div className="flex-1 min-w-0">
              <h3 className="text-gray-900 font-semibold truncate text-base">{snap.title}</h3>
              <p className="text-gray-600 text-sm mt-1">
                {snap.amount ? `${snap.amount} ${snap.assetCode || 'XLM'}` : 'Open amount'}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => copyLink(snap.id)}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                Copy
              </button>
              <a
                href={`/s/${snap.id}`}
                target="_blank"
                rel="noopener"
                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                View
              </a>
              <button
                onClick={() => deleteSnap(snap.id)}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
