'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useHoldEscToHub } from '@/hooks/useHoldEscToHub';
import { usePlayfieldCellSize } from '@/hooks/usePlayfieldCellSize';
import { useCtrlRRestart } from '@/hooks/useCtrlRRestart';
import { GameCanvas } from '@/components/game/GameCanvas';
import { NextQueue } from '@/components/game/NextQueue';
import { HoldBox } from '@/components/game/HoldBox';
import { GameHUD } from '@/components/game/GameHUD';
import { GarbageMeter } from '@/components/game/GarbageMeter';
import { GameUnderBoardBar } from '@/components/game/GameUnderBoardBar';
import { HoldEscOverlay } from '@/components/game/HoldEscOverlay';
import { GamePlayfield } from '@/components/game/GamePlayfield';
import { Button } from '@/components/ui/Button';
import { Navbar } from '@/components/layout/Navbar';
import { BOARD_HEIGHT } from '@/lib/game/constants';

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  const ms2 = Math.floor((ms % 1000) / 10);
  return `${m}:${String(sec).padStart(2, '0')}.${String(ms2).padStart(2, '0')}`;
}

export default function SprintPage() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const mode = useMemo(() => ({ type: 'sprint' as const, targetLines: 40 }), []);
  const playfieldRef = useRef<HTMLDivElement>(null);
  const cellSize = usePlayfieldCellSize();

  const { gameState, isActive, isFinished, finalState, startGame, restartGame } = useGameEngine(mode);
  const escProgress = useHoldEscToHub(isActive || isFinished);
  useCtrlRRestart({ enabled: isActive || isFinished, onRestart: restartGame });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isActive) playfieldRef.current?.focus({ preventScroll: true });
  }, [isActive]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050508] text-zinc-400">
        Loading…
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#050508] text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            'radial-gradient(ellipse 120% 80% at 50% 100%, rgba(140,100,20,0.25), transparent 55%), linear-gradient(180deg, #0a0a12 0%, #141008 45%, #18120a 100%)',
        }}
      />
      <Navbar />
      <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-2 pb-16 pt-14 sm:px-4 sm:pt-16">
        {!isActive && !isFinished && (
          <div className="text-center">
            <h1 className="mb-4 text-3xl font-black tracking-tight sm:text-4xl">
              <span className="text-yellow-400">Sprint</span> 40L
            </h1>
            <p className="mb-8 text-sm text-zinc-400 sm:text-base">Clear 40 lines as fast as possible</p>
            <Button variant="primary" size="lg" onClick={startGame}>
              Start sprint
            </Button>
          </div>
        )}

        {(isActive || isFinished) && gameState ? (
          <GamePlayfield playfieldRef={playfieldRef} className="px-1 sm:px-2">
            <div className="absolute right-2 top-2 rounded border border-white/10 bg-black/40 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.15em] text-zinc-300 sm:right-4 sm:top-4 sm:text-[0.65rem]">
              Sprint
            </div>

            <div className="mt-8 grid w-full grid-cols-1 items-start justify-items-center gap-4 sm:mt-10 lg:grid-cols-[auto_minmax(0,auto)_auto] lg:justify-center lg:gap-5">
              <div className="flex w-full max-w-[20rem] flex-row justify-center gap-4 lg:max-w-none lg:flex-col lg:justify-start">
                <HoldBox heldPiece={gameState.heldPiece} canHold={gameState.canHold} />
              </div>

              <div className="flex w-full max-w-[min(100vw-1rem,28rem)] flex-col items-center gap-3 sm:max-w-none">
                <div className="relative flex w-max max-w-full shrink-0 flex-row items-stretch overflow-hidden rounded-sm shadow-lg shadow-black/30">
                  <GarbageMeter lines={gameState.garbageQueue} heightPx={BOARD_HEIGHT * cellSize} />
                  <GameCanvas
                    gameState={gameState}
                    cellSize={cellSize}
                    suppressGameOverOverlay={isFinished}
                  />
                  {isFinished && finalState ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-[2px]">
                      <h2 className="mb-2 text-2xl font-black text-yellow-400 sm:text-3xl">Sprint complete</h2>
                      <p className="mb-2 text-4xl font-black tabular-nums text-white sm:text-5xl">
                        {formatTime(finalState.gameTime)}
                      </p>
                      <p className="mb-6 text-sm text-zinc-400 sm:text-base">40 lines cleared</p>
                      <Button variant="primary" onClick={restartGame}>
                        Try again
                      </Button>
                    </div>
                  ) : null}
                </div>
                <GameUnderBoardBar gameState={gameState} modeLabel="Sprint" subtitle="40 lines" />
              </div>

              <div className="flex w-full max-w-[20rem] flex-col gap-3 sm:max-w-none lg:max-w-[min(100%,10rem)]">
                <NextQueue queue={gameState.nextQueue} />
                <GameHUD gameState={gameState} mode="sprint" targetLines={40} />
              </div>
            </div>
          </GamePlayfield>
        ) : null}

        {isActive ? (
          <p className="mt-4 text-center text-[0.6rem] uppercase tracking-widest text-zinc-600 sm:mt-6">
            Hold Esc — hub
          </p>
        ) : null}
      </div>
      <HoldEscOverlay progress={escProgress} />
    </div>
  );
}
