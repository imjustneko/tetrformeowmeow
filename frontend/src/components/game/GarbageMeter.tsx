'use client';

type Props = {
  lines: number;
  max?: number;
  heightPx: number;
};

/** Thin vertical gauge beside the matrix (incoming garbage). */
export function GarbageMeter({ lines, max = 12, heightPx }: Props) {
  const ratio = Math.min(1, Math.max(0, lines / max));
  const fill = Math.round(ratio * heightPx);
  return (
    <div
      className="flex w-2 shrink-0 flex-col justify-end border border-white/20 bg-black/40"
      style={{ height: heightPx }}
      aria-hidden
    >
      <div
        className="w-full bg-gradient-to-t from-orange-600 to-amber-400"
        style={{ height: fill }}
      />
    </div>
  );
}
