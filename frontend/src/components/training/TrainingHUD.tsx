'use client';

import type { LessonStep } from '@/lib/training/lessons';
import type { StepResult } from '@/lib/training/trainingEngine';
import { PIECE_COLORS } from '@/lib/game/constants';
import { getPieceMatrix } from '@/lib/game/tetrominos';
import type { PieceType } from '@/lib/game/types';

interface TrainingHUDProps {
  step: LessonStep | null;
  currentStepIndex: number;
  totalSteps: number;
  stepResult: StepResult;
  feedbackMessage: string;
  onRetry: () => void;
  onToggleHologram: () => void;
  showHologram: boolean;
}

export function TrainingHUD({
  step,
  currentStepIndex,
  totalSteps,
  stepResult,
  feedbackMessage,
  onRetry,
  onToggleHologram,
  showHologram,
}: TrainingHUDProps) {
  return (
    <div className="flex w-[200px] flex-col gap-3">
      <div className="rounded-xl border border-[#2a2a3a] bg-[#12121a] p-3">
        <p className="mb-2 text-xs uppercase tracking-wider text-gray-500">Progress</p>
        <div className="flex gap-1.5">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-colors ${
                i < currentStepIndex ? 'bg-green-500' : i === currentStepIndex ? 'bg-cyan-400' : 'bg-[#2a2a3a]'
              }`}
            />
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-400">
          Step {Math.min(currentStepIndex + 1, totalSteps)} of {totalSteps}
        </p>
      </div>

      {step ? (
        <div className="rounded-xl border border-[#1a3a5a] bg-[#0d1a2a] p-3">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-blue-400">Hologram Tip</p>
          <p className="mb-2 text-sm font-medium leading-snug text-white">{step.tip}</p>
          {step.subTip ? (
            <p
              className={`text-xs font-semibold leading-snug ${
                step.subTipColor === 'yellow'
                  ? 'text-yellow-400'
                  : step.subTipColor === 'red'
                    ? 'text-red-400'
                    : 'text-cyan-400'
              }`}
            >
              {step.subTip}
            </p>
          ) : null}
        </div>
      ) : null}

      {step ? (
        <div className="rounded-xl border border-[#2a2a3a] bg-[#12121a] p-3">
          <p className="mb-2 text-xs uppercase tracking-wider text-gray-500">Needed</p>
          <PieceMini type={step.neededPiece} />
        </div>
      ) : null}

      {feedbackMessage ? (
        <div
          className={`rounded-xl border p-3 text-sm font-semibold leading-snug transition-all ${
            stepResult === 'success'
              ? 'border-green-500/40 bg-green-900/30 text-green-400'
              : stepResult === 'fail'
                ? 'border-red-500/40 bg-red-900/30 text-red-400'
                : 'border-[#2a2a3a] bg-[#12121a] text-gray-400'
          }`}
        >
          {feedbackMessage}
        </div>
      ) : null}

      <button
        onClick={onToggleHologram}
        className={`w-full rounded-lg border py-2 text-sm font-bold transition-colors ${
          showHologram
            ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20'
            : 'border-[#2a2a3a] bg-[#1a1a28] text-gray-500 hover:text-gray-300'
        }`}
      >
        {showHologram ? 'Hologram ON' : 'Hologram OFF'}
      </button>

      <button
        onClick={onRetry}
        className="w-full rounded-lg border border-[#2a2a3a] bg-[#1a1a28] py-2 text-sm font-bold text-gray-300 transition-colors hover:border-gray-500 hover:text-white"
      >
        Retry
      </button>
    </div>
  );
}

function PieceMini({ type }: { type: PieceType }) {
  const matrix = getPieceMatrix(type, 0);
  const color = PIECE_COLORS[type];
  const cell = 18;

  let minR = 3;
  let maxR = 0;
  let minC = 3;
  let maxC = 0;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (!matrix[r][c]) continue;
      minR = Math.min(minR, r);
      maxR = Math.max(maxR, r);
      minC = Math.min(minC, c);
      maxC = Math.max(maxC, c);
    }
  }

  const rows = maxR - minR + 1;
  const cols = maxC - minC + 1;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: `repeat(${rows},${cell}px)`,
        gridTemplateColumns: `repeat(${cols},${cell}px)`,
        gap: 2,
      }}
    >
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => (
          <div
            key={`${r}-${c}`}
            style={{
              width: cell,
              height: cell,
              backgroundColor: matrix[r + minR][c + minC] ? color : 'transparent',
              borderRadius: 2,
              boxShadow: matrix[r + minR][c + minC] ? `0 0 6px ${color}66` : 'none',
            }}
          />
        ))
      )}
    </div>
  );
}
