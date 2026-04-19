'use client';

import type { ReactNode } from 'react';
import type { PieceType } from '@/lib/game/types';
import { PIECE_COLORS } from '@/lib/game/constants';
import { getPieceMatrix } from '@/lib/game/tetrominos';

interface NextQueueProps {
  queue: PieceType[];
}

export function NextQueue({ queue }: NextQueueProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-zinc-400">Next</p>
      {queue.slice(0, 5).map((piece, i) => (
        <PieceMini key={`${piece}-${i}`} type={piece} size={i === 0 ? 'lg' : 'sm'} />
      ))}
    </div>
  );
}

function PieceMini({ type, size }: { type: PieceType; size: 'lg' | 'sm' }) {
  const matrix = getPieceMatrix(type, 0);
  const cellSize = size === 'lg' ? 18 : 14;
  const color = PIECE_COLORS[type];

  let minRow = 3;
  let maxRow = 0;
  let minCol = 3;
  let maxCol = 0;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (matrix[r][c] !== 0) {
        minRow = Math.min(minRow, r);
        maxRow = Math.max(maxRow, r);
        minCol = Math.min(minCol, c);
        maxCol = Math.max(maxCol, c);
      }
    }
  }

  const rows = maxRow - minRow + 1;
  const cols = maxCol - minCol + 1;

  const cells: ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const filled = matrix[r + minRow][c + minCol] !== 0;
      cells.push(
        <div
          key={`${r}-${c}`}
          style={{
            width: cellSize,
            height: cellSize,
            backgroundColor: filled ? color : 'transparent',
            borderRadius: 1,
          }}
        />
      );
    }
  }

  return (
    <div
      className="flex items-center justify-center border border-white/20 bg-black/35 backdrop-blur-sm"
      style={{ width: 80, height: size === 'lg' ? 52 : 44 }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gap: 1,
        }}
      >
        {cells}
      </div>
    </div>
  );
}
