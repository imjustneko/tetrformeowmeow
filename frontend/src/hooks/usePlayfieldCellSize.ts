'use client';

import { useEffect, useState } from 'react';

/**
 * Responsive cell size so the 10×20 board fits on small viewports without horizontal scroll.
 */
export function usePlayfieldCellSize(): number {
  const [cell, setCell] = useState(28);

  useEffect(() => {
    const compute = () => {
      const w = typeof window !== 'undefined' ? window.innerWidth : 1024;
      // Leave room for hold (~88px) + meter (~8px) + padding + next column (~100px)
      const reserved = 220;
      const maxBoard = Math.min(360, Math.max(200, w - reserved));
      const next = Math.max(12, Math.min(30, Math.floor(maxBoard / 10)));
      setCell(next);
    };
    compute();
    window.addEventListener('resize', compute, { passive: true });
    return () => window.removeEventListener('resize', compute);
  }, []);

  return cell;
}
