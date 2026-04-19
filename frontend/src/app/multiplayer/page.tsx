'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { VersusClient } from '@/components/multiplayer/VersusClient';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';

export default function MultiplayerPage() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050508] text-zinc-400">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] text-white">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-20">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-zinc-500">Multiplayer</p>
            <h1 className="text-3xl font-black tracking-tight">
              <span className="text-[#ff4477]">Ranked</span> 1v1
            </h1>
            <p className="mt-2 max-w-xl text-sm text-zinc-400">
              Matchmaking pairs you with another player. Both ready up, survive garbage, and top your opponent out.
            </p>
          </div>
          <Link href="/multiplayer/custom">
            <Button variant="secondary">Private room</Button>
          </Link>
        </div>

        <VersusClient mode="ranked" startWith="queue" currentUserId={user.id} />
      </main>
    </div>
  );
}
