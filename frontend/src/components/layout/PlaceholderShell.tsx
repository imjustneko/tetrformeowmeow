'use client';

import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';

type Props = {
  title: string;
  description: string;
  backHref?: string;
};

export function PlaceholderShell({ title, description, backHref = '/dashboard' }: Props) {
  return (
    <div className="min-h-screen bg-[#050508] text-zinc-100">
      <Navbar />
      <main className="mx-auto max-w-lg px-6 pb-20 pt-28">
        <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-[0.25em] text-zinc-500">MeowTetr</p>
        <h1 className="text-3xl font-black uppercase tracking-tight text-white">{title}</h1>
        <p className="mt-4 text-sm leading-relaxed text-zinc-400">{description}</p>
        <Link
          href={backHref}
          className="mt-10 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-cyan-400 transition-colors hover:text-cyan-300"
        >
          ← Back
        </Link>
      </main>
    </div>
  );
}
