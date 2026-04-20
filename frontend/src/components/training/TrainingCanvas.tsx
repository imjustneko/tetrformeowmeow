'use client';

import { useEffect, useRef } from 'react';
import type { GameState, PieceType } from '@/lib/game/types';
import { BOARD_WIDTH, BOARD_HEIGHT, HIDDEN_ROWS, PIECE_COLORS, PIECE_GHOST_COLORS } from '@/lib/game/constants';
import { getGhostPosition } from '@/lib/game/board';
import { getPieceMatrix } from '@/lib/game/tetrominos';

const PIECE_TYPE_MAP = ['', 'I', 'O', 'T', 'S', 'Z', 'J', 'L', 'G'];
const CELL = 28;

interface HologramTarget {
  x: number;
  y: number;
  rotation: 0 | 1 | 2 | 3;
  piece: PieceType;
}

interface TrainingCanvasProps {
  gameState: GameState;
  hologram: HologramTarget | null;
  showHologram: boolean;
}

export function TrainingCanvas({ gameState, hologram, showHologram }: TrainingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);
  const pulseRef = useRef(0);

  const width = BOARD_WIDTH * CELL;
  const height = BOARD_HEIGHT * CELL;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    const draw = () => {
      frame++;
      pulseRef.current = (Math.sin(frame * 0.08) + 1) / 2;

      ctx.fillStyle = '#08081a';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= BOARD_WIDTH; x++) {
        ctx.beginPath();
        ctx.moveTo(x * CELL, 0);
        ctx.lineTo(x * CELL, height);
        ctx.stroke();
      }
      for (let y = 0; y <= BOARD_HEIGHT; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * CELL);
        ctx.lineTo(width, y * CELL);
        ctx.stroke();
      }

      for (let row = 0; row < BOARD_HEIGHT; row++) {
        for (let col = 0; col < BOARD_WIDTH; col++) {
          const cell = gameState.board[row + HIDDEN_ROWS]?.[col] ?? 0;
          if (cell === 0) continue;
          const type = PIECE_TYPE_MAP[cell] ?? 'G';
          drawCell(ctx, col, row, PIECE_COLORS[type] || '#445566', CELL);
        }
      }

      if (gameState.activePiece) {
        const ghost = getGhostPosition(gameState.board, gameState.activePiece);
        const matrix = getPieceMatrix(gameState.activePiece.type, gameState.activePiece.rotation);
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 4; c++) {
            if (!matrix[r][c]) continue;
            const bx = gameState.activePiece.position.x + c;
            const by = ghost.y + r - HIDDEN_ROWS;
            if (by >= 0 && by < BOARD_HEIGHT) {
              drawGhost(ctx, bx, by, PIECE_GHOST_COLORS[gameState.activePiece.type], CELL);
            }
          }
        }
      }

      if (showHologram && hologram) {
        const hMatrix = getPieceMatrix(hologram.piece, hologram.rotation);
        const pulse = pulseRef.current;
        const alpha = 0.25 + pulse * 0.35;
        const color = PIECE_COLORS[hologram.piece] || '#00ffff';

        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 4; c++) {
            if (!hMatrix[r][c]) continue;
            const bx = hologram.x + c;
            const by = hologram.y + r;
            if (by < 0 || by >= BOARD_HEIGHT || bx < 0 || bx >= BOARD_WIDTH) continue;

            const px = bx * CELL;
            const py = by * CELL;

            ctx.shadowColor = color;
            ctx.shadowBlur = 8 + pulse * 12;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = color;
            ctx.fillRect(px + 2, py + 2, CELL - 4, CELL - 4);

            ctx.globalAlpha = 0.5 + pulse * 0.4;
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(px + 2, py + 2, CELL - 4, CELL - 4);

            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
          }
        }
      }

      if (gameState.activePiece) {
        const matrix = getPieceMatrix(gameState.activePiece.type, gameState.activePiece.rotation);
        const color = PIECE_COLORS[gameState.activePiece.type];
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 4; c++) {
            if (!matrix[r][c]) continue;
            const bx = gameState.activePiece.position.x + c;
            const by = gameState.activePiece.position.y + r - HIDDEN_ROWS;
            if (by >= 0 && by < BOARD_HEIGHT) {
              drawCell(ctx, bx, by, color, CELL);
            }
          }
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [gameState, hologram, showHologram, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ imageRendering: 'pixelated', display: 'block' }}
      className="rounded border border-[#2a2a3a]"
    />
  );
}

function drawCell(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, size: number) {
  const px = x * size;
  const py = y * size;
  const p = 1;
  ctx.fillStyle = color;
  ctx.fillRect(px + p, py + p, size - p * 2, size - p * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.fillRect(px + p, py + p, size - p * 2, 3);
  ctx.fillRect(px + p, py + p, 3, size - p * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.fillRect(px + p, py + size - p - 3, size - p * 2, 3);
  ctx.fillRect(px + size - p - 3, py + p, 3, size - p * 2);
}

function drawGhost(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, size: number) {
  const px = x * size;
  const py = y * size;
  ctx.fillStyle = color;
  ctx.fillRect(px + 1, py + 1, size - 2, size - 2);
  ctx.strokeStyle = color.replace('0.2', '0.4');
  ctx.lineWidth = 1;
  ctx.strokeRect(px + 1, py + 1, size - 2, size - 2);
}
