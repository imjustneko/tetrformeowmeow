import { useCallback } from 'react';
import type { ClearResult } from '@/lib/game/types';
import { soundEngine } from '@/lib/audio/soundEngine';
import { useAudioStore } from '@/store/audioStore';

export function useGameSounds() {
  const { sfxEnabled } = useAudioStore();

  const play = useCallback(
    (fn: () => void) => {
      if (sfxEnabled) fn();
    },
    [sfxEnabled]
  );

  return {
    onMove: () => play(() => soundEngine.move()),
    onRotate: () => play(() => soundEngine.rotate()),
    onSoftDrop: () => play(() => soundEngine.softDrop()),
    onHardDrop: () => play(() => soundEngine.hardDrop()),
    onHold: () => play(() => soundEngine.hold()),
    onGameOver: () => play(() => soundEngine.gameOver()),
    onWin: () => play(() => soundEngine.win()),
    onKO: () => play(() => soundEngine.ko()),
    onLevelUp: () => play(() => soundEngine.levelUp()),
    onCountdown: () => play(() => soundEngine.countdown()),
    onCountdownGo: () => play(() => soundEngine.countdownGo()),
    onGarbage: (lines: number) => play(() => soundEngine.garbageReceive(lines)),

    onClear: (result: ClearResult) => {
      if (!sfxEnabled) return;

      if (result.isTSpin && result.linesCleared === 2) {
        soundEngine.tSpinDouble();
      } else if (result.isTSpin) {
        soundEngine.tSpin();
      } else if (result.linesCleared > 0) {
        soundEngine.lineClear(result.linesCleared);
      }

      if (result.isBackToBack && result.linesCleared > 0) {
        setTimeout(() => soundEngine.backToBack(), 150);
      }
      if (result.isPerfectClear) {
        setTimeout(() => soundEngine.perfectClear(), 100);
      }
      if (result.combo > 0) {
        setTimeout(() => soundEngine.combo(result.combo), 200);
      }
    },
  };
}
