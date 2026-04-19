'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import api from '@/lib/api';

interface LeaderboardEntry {
  id: string;
  username: string;
  rating: number;
  stats: { gamesPlayed: number; wins: number; avgAPM: number; avgPPS: number } | null;
}

function getRank(rating: number) {
  if (rating < 500) return { name: 'Stone', color: 'text-gray-400' };
  if (rating < 800) return { name: 'Iron', color: 'text-gray-300' };
  if (rating < 1100) return { name: 'Bronze', color: 'text-amber-600' };
  if (rating < 1400) return { name: 'Silver', color: 'text-gray-200' };
  if (rating < 1700) return { name: 'Gold', color: 'text-yellow-400' };
  if (rating < 2000) return { name: 'Platinum', color: 'text-cyan-300' };
  if (rating < 2400) return { name: 'Diamond', color: 'text-blue-400' };
  return { name: 'Master', color: 'text-purple-400' };
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/api/users/leaderboard')
      .then((r) => setEntries(r.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#050508] text-white">
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 py-8 pt-20">
        <h1 className="mb-8 text-3xl font-black">
          <span className="text-cyan-400">Global</span> leaderboard
        </h1>

        {loading ? (
          <div className="animate-pulse py-20 text-center text-zinc-400">Loading…</div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#2a2a3a] bg-[#12121a]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2a3a] text-left">
                  <th className="w-16 px-6 py-4 text-xs uppercase tracking-wider text-zinc-500">#</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider text-zinc-500">Player</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider text-zinc-500">Rank</th>
                  <th className="px-6 py-4 text-right text-xs uppercase tracking-wider text-zinc-500">Rating</th>
                  <th className="px-6 py-4 text-right text-xs uppercase tracking-wider text-zinc-500">Games</th>
                  <th className="px-6 py-4 text-right text-xs uppercase tracking-wider text-zinc-500">Wins</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => {
                  const rank = getRank(entry.rating);
                  return (
                    <tr
                      key={entry.id}
                      className="border-b border-[#1e1e2e] transition-colors hover:bg-[#1a1a28]"
                    >
                      <td className="px-6 py-4 font-mono text-zinc-500">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                      </td>
                      <td className="px-6 py-4 font-bold text-white">{entry.username}</td>
                      <td className={`px-6 py-4 font-semibold ${rank.color}`}>{rank.name}</td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-cyan-400">{entry.rating}</td>
                      <td className="px-6 py-4 text-right text-zinc-400">{entry.stats?.gamesPlayed ?? 0}</td>
                      <td className="px-6 py-4 text-right text-zinc-400">{entry.stats?.wins ?? 0}</td>
                    </tr>
                  );
                })}
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                      No players yet. Be the first!
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
