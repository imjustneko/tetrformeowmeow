'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useAudioStore } from '@/store/audioStore';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#050508]/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 sm:h-14 sm:flex-nowrap">
        <Link
          href="/"
          className="order-1 shrink-0 text-lg font-black tracking-tight sm:text-xl"
        >
          <span className="text-[#ff4477]">Meow</span>
          <span className="text-white">Tetr</span>
        </Link>

        {isAuthenticated ? (
          <nav className="order-3 flex w-full flex-wrap items-center justify-end gap-x-5 gap-y-2 text-xs font-bold uppercase tracking-wider text-zinc-400 sm:order-2 sm:w-auto sm:justify-start">
            <Link href="/dashboard" className="whitespace-nowrap text-zinc-300 transition-colors hover:text-white">
              Home
            </Link>
            <Link href="/leaderboard" className="whitespace-nowrap transition-colors hover:text-white">
              Leaderboard
            </Link>
            <Link href="/train" className="whitespace-nowrap transition-colors hover:text-white">
              Train
            </Link>
            <Link href="/settings" className="whitespace-nowrap transition-colors hover:text-white">
              Settings
            </Link>
            <Link
              href={`/profile/${encodeURIComponent(user?.username ?? '')}`}
              className="whitespace-nowrap font-extrabold text-cyan-400 transition-colors hover:text-cyan-300"
            >
              {user?.username}
            </Link>
            <MuteButton />
            <Button variant="ghost" size="sm" type="button" onClick={handleLogout} className="uppercase">
              Logout
            </Button>
          </nav>
        ) : (
          <div className="order-2 flex shrink-0 items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm">
                Register
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

function MuteButton() {
  const { sfxEnabled, musicEnabled, toggleSfx, toggleMusic } = useAudioStore();
  const allMuted = !sfxEnabled && !musicEnabled;

  const handleToggle = () => {
    if (allMuted) {
      if (!sfxEnabled) toggleSfx();
      if (!musicEnabled) toggleMusic();
    } else {
      if (sfxEnabled) toggleSfx();
      if (musicEnabled) toggleMusic();
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="text-lg text-gray-500 transition-colors hover:text-white"
      title={allMuted ? 'Unmute' : 'Mute'}
    >
      {allMuted ? '🔇' : '🔊'}
    </button>
  );
}
