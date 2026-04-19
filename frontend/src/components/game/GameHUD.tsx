'use client';

import type { GameState } from '@/lib/game/types';

interface GameHUDProps {
  gameState: GameState;
  mode: string;
  targetLines?: number;
  timeLimit?: number;
}

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  const ms2 = Math.floor((ms % 1000) / 10);
  return `${m}:${String(sec).padStart(2, '0')}.${String(ms2).padStart(2, '0')}`;
}

function calcPPS(state: GameState): string {
  const secs = state.gameTime / 1000;
  if (secs < 0.1) return '0.00';
  return (state.piecesPlaced / secs).toFixed(2);
}

export function GameHUD({ gameState, mode, targetLines, timeLimit }: GameHUDProps) {
  const timeLeft = timeLimit ? Math.max(0, timeLimit - gameState.gameTime) : null;

  return (
    <div className="flex w-[7.5rem] shrink-0 flex-col gap-2 border border-white/10 bg-black/30 p-2 backdrop-blur-sm sm:w-[8.5rem] sm:p-3">
      <StatBox label="Score" value={gameState.score.toLocaleString()} highlight />

      {mode === 'sprint' && targetLines ? (
        <StatBox label="Lines" value={`${gameState.lines} / ${targetLines}`} />
      ) : null}
      {mode === 'ultra' && timeLeft !== null ? (
        <StatBox label="Time Left" value={formatTime(timeLeft)} highlight={timeLeft < 30000} />
      ) : null}
      {mode === 'solo' ? <StatBox label="Lines" value={String(gameState.lines)} /> : null}

      <StatBox label="Level" value={String(gameState.level)} />
      <StatBox label="Time" value={formatTime(gameState.gameTime)} />
      <StatBox label="PPS" value={calcPPS(gameState)} />

      {gameState.combo > 0 ? (
        <div className="min-h-[1.75rem] text-center">
          <span className="text-lg font-black text-yellow-400">{gameState.combo}x COMBO</span>
        </div>
      ) : null}

      {gameState.isBackToBack ? (
        <div className="text-center">
          <span className="text-xs font-bold text-cyan-400">BACK-TO-BACK</span>
        </div>
      ) : null}

      {gameState.lastClear && gameState.lastClear.linesCleared > 0 ? (
        <div className="text-center text-xs font-semibold uppercase text-zinc-400">
          {gameState.lastClear.clearType.replace(/([A-Z])/g, ' $1').trim()}
          {gameState.lastClear.isPerfectClear ? (
            <div className="font-black text-yellow-300">PERFECT CLEAR!</div>
          ) : null}
        </div>
      ) : null}

      {gameState.garbageQueue > 0 ? (
        <div className="rounded border border-red-500/30 bg-red-900/30 px-2 py-1 text-center">
          <span className="text-sm font-bold text-red-400">⚠ {gameState.garbageQueue} incoming</span>
        </div>
      ) : null}
    </div>
  );
}

function StatBox({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="min-h-[3.25rem] border border-white/10 bg-black/25 px-2 py-1.5 text-center sm:px-3 sm:py-2">
      <div
        className={`min-h-[1.5rem] min-w-[6ch] font-mono text-base font-black tabular-nums leading-tight sm:text-lg ${
          highlight ? 'text-cyan-400' : 'text-white'
        }`}
      >
        {value}
      </div>
      <div className="text-[0.65rem] uppercase tracking-wider text-zinc-500 sm:text-xs">{label}</div>
    </div>
  );
}
