'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Navbar } from '@/components/layout/Navbar';
import { MenuMegaButton } from '@/components/ui/MenuMegaButton';

function getRank(rating: number): { name: string; color: string } {
  if (rating < 500) return { name: 'Stone', color: 'text-zinc-500' };
  if (rating < 800) return { name: 'Iron', color: 'text-zinc-400' };
  if (rating < 1100) return { name: 'Bronze', color: 'text-amber-600' };
  if (rating < 1400) return { name: 'Silver', color: 'text-zinc-200' };
  if (rating < 1700) return { name: 'Gold', color: 'text-yellow-400' };
  if (rating < 2000) return { name: 'Platinum', color: 'text-cyan-300' };
  if (rating < 2400) return { name: 'Diamond', color: 'text-blue-400' };
  return { name: 'Master', color: 'text-purple-400' };
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050508]">
        <div className="animate-pulse text-sm font-bold uppercase tracking-[0.3em] text-cyan-400">Loading</div>
      </div>
    );
  }

  const rank = getRank(user.rating);

  return (
    <div className="min-h-screen bg-[#050508] text-white">
      <Navbar />

      <div className="mx-auto max-w-3xl px-4 pb-16 pt-20 sm:pt-24">
        <div className="mb-10 flex flex-col gap-1 border-b border-white/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-zinc-500">Welcome back</p>
            <h1 className="mt-1 text-2xl font-black uppercase tracking-tight sm:text-3xl">
              <span className="text-white">{user.username}</span>
            </h1>
            <p className={`mt-2 text-sm font-bold uppercase tracking-wide ${rank.color}`}>
              {rank.name} · {user.rating} TR
            </p>
          </div>
          <Link
            href={`/profile/${encodeURIComponent(user.username)}`}
            className="mt-4 shrink-0 text-xs font-bold uppercase tracking-wider text-cyan-400 hover:text-cyan-300 sm:mt-0"
          >
            View profile →
          </Link>
        </div>

        <p className="mb-4 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-zinc-500">Play</p>
        <div className="flex flex-col gap-3">
          <MenuMegaButton
            href="/multiplayer"
            icon="MP"
            title="Multiplayer"
            subtitle="Ranked 1v1 and online matches"
            tone="multiplayer"
          />
          <MenuMegaButton
            href="/play/solo"
            icon="1P"
            title="Solo"
            subtitle="Practice, sprint, and ultra modes"
            tone="solo"
          />
          <MenuMegaButton
            href="/train"
            icon="TR"
            title="Training"
            subtitle="Lessons, drills, and skill paths"
            tone="arcade"
          />
          <MenuMegaButton
            href="/multiplayer/custom"
            icon="RM"
            title="Custom room"
            subtitle="Play with friends using a room code"
            tone="config"
          />
        </div>

        <p className="mb-3 mt-10 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-zinc-500">Quick modes</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {[
            { href: '/play/sprint', label: 'Sprint 40L' },
            { href: '/play/ultra', label: 'Ultra 2:00' },
            { href: '/leaderboard', label: 'Leaderboard' },
          ].map((x) => (
            <Link
              key={x.href}
              href={x.href}
              className="rounded-sm border border-white/10 bg-zinc-900/60 px-4 py-3 text-center text-xs font-black uppercase tracking-wide text-zinc-200 transition-colors hover:border-cyan-500/40 hover:text-cyan-300"
            >
              {x.label}
            </Link>
          ))}
        </div>

        <p className="mb-3 mt-10 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-zinc-500">Your stats</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: 'Rating', value: String(user.rating) },
            { label: 'Games', value: '—' },
            { label: 'APM', value: '—' },
            { label: 'PPS', value: '—' },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-sm border border-white/10 bg-zinc-950/80 px-3 py-4 text-center"
            >
              <div className="text-xl font-black tabular-nums text-cyan-400">{s.value}</div>
              <div className="mt-1 text-[0.6rem] font-bold uppercase tracking-wider text-zinc-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
