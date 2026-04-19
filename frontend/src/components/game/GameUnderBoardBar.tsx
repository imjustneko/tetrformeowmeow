'use client';

import type { GameState } from '@/lib/game/types';

type Props = {
  gameState: GameState;
  modeLabel: string;
  /** Sprint target lines, ultra time limit ms, etc. */
  subtitle?: string;
};

export function GameUnderBoardBar({ gameState, modeLabel, subtitle }: Props) {
  return (
    <div className="mt-4 flex w-full max-w-[320px] flex-col items-center gap-1 border-t border-white/10 pt-4 text-center">
      {gameState.isBackToBack ? (
        <p className="text-sm font-black tracking-wide text-amber-300">B2B</p>
      ) : null}
      <p className="min-h-[2.5rem] min-w-[10ch] font-mono text-3xl font-black tabular-nums tracking-tight text-white">
        {gameState.score.toLocaleString()}
      </p>
      <div className="flex min-h-[1.25rem] items-center gap-3 font-mono text-sm tabular-nums text-zinc-300">
        <span>{gameState.lines}</span>
        <span className="text-zinc-600">·</span>
        <span className="text-lg text-zinc-200">∞</span>
      </div>
      <div className="mt-1 flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-zinc-500">
        <span className="rounded border border-white/10 bg-black/30 px-2 py-0.5 text-zinc-300">{modeLabel}</span>
        {subtitle ? <span className="text-zinc-600">{subtitle}</span> : null}
      </div>
    </div>
  );
}
