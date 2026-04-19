'use client';

export function HoldEscOverlay({ progress }: { progress: number }) {
  if (progress <= 0) return null;
  const pct = Math.round(progress * 100);
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 w-[min(22rem,calc(100vw-2rem)))] -translate-x-1/2 transition-opacity duration-150">
      <div className="border border-white/15 bg-black/55 px-4 py-2.5 shadow-lg backdrop-blur-md">
        <p className="text-center text-[0.65rem] font-bold uppercase tracking-[0.2em] text-zinc-400">
          Hold Esc — hub
        </p>
        <div className="mt-2 h-1.5 overflow-hidden bg-zinc-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 transition-[width] duration-75 ease-linear"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
