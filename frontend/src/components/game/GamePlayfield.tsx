'use client';

import type { ReactNode } from 'react';

type Props = {
  /** Focusable region for game keys (Space etc.) */
  playfieldRef?: React.RefObject<HTMLDivElement | null>;
  children: ReactNode;
  className?: string;
};

/**
 * Stable-width grid: avoids flex “centering jitter” when inner content width changes every frame.
 */
export function GamePlayfield({ playfieldRef, children, className = '' }: Props) {
  return (
    <div
      ref={playfieldRef}
      tabIndex={-1}
      className={`relative mx-auto w-full max-w-[min(100vw-1rem,72rem)] outline-none ${className}`}
    >
      {children}
    </div>
  );
}
