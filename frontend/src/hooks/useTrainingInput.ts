import { useEffect, useRef, useCallback } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { TrainingEngine } from '@/lib/training/trainingEngine';

export function useTrainingInput(
  engineRef: React.RefObject<TrainingEngine | null>,
  active: boolean
) {
  const { keybinds, das, arr } = useSettingsStore();
  const heldKeys = useRef<Set<string>>(new Set());
  const dasTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const arrIntervals = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());
  const softDropInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearKeyTimers = useCallback((code: string) => {
    const dt = dasTimers.current.get(code);
    if (dt) {
      clearTimeout(dt);
      dasTimers.current.delete(code);
    }
    const ai = arrIntervals.current.get(code);
    if (ai) {
      clearInterval(ai);
      arrIntervals.current.delete(code);
    }
  }, []);

  const clearAllTimers = useCallback(() => {
    dasTimers.current.forEach((t) => clearTimeout(t));
    arrIntervals.current.forEach((t) => clearInterval(t));
    dasTimers.current.clear();
    arrIntervals.current.clear();
    if (softDropInterval.current) {
      clearInterval(softDropInterval.current);
      softDropInterval.current = null;
    }
  }, []);

  const clearHeldKeys = useCallback(() => {
    heldKeys.current.clear();
  }, []);

  const handleAction = useCallback((action: string) => {
    const engine = engineRef.current;
    if (!engine) return;
    switch (action) {
      case 'moveLeft':
        engine.moveLeft();
        break;
      case 'moveRight':
        engine.moveRight();
        break;
      case 'softDrop':
        engine.softDrop();
        break;
      case 'hardDrop':
        engine.hardDrop();
        break;
      case 'rotateClockwise':
        engine.rotateClockwise();
        break;
      case 'rotateCounter':
        engine.rotateCounter();
        break;
      case 'rotate180':
        engine.rotate180();
        break;
      case 'hold':
        engine.hold();
        break;
    }
  }, [engineRef]);

  useEffect(() => {
    if (!active) return;
    const keyToAction: Record<string, string> = {};
    for (const [action, key] of Object.entries(keybinds)) keyToAction[key] = action;

    const onKeyDown = (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
      const action = keyToAction[e.code];
      if (!action) return;
      if (heldKeys.current.has(e.code)) return;
      heldKeys.current.add(e.code);
      handleAction(action);

      if (action === 'moveLeft' || action === 'moveRight') {
        clearKeyTimers(e.code);
        const code = e.code;
        const dasT = setTimeout(() => {
          const ai = setInterval(() => {
            if (heldKeys.current.has(code)) {
              handleAction(action);
            } else {
              clearInterval(ai);
              arrIntervals.current.delete(code);
            }
          }, arr === 0 ? 1 : arr);
          arrIntervals.current.set(code, ai);
          dasTimers.current.delete(code);
        }, das);
        dasTimers.current.set(code, dasT);
      }
      if (action === 'softDrop') {
        if (softDropInterval.current) clearInterval(softDropInterval.current);
        const code = e.code;
        softDropInterval.current = setInterval(() => {
          if (heldKeys.current.has(code)) {
            handleAction('softDrop');
          } else if (softDropInterval.current) {
            clearInterval(softDropInterval.current);
            softDropInterval.current = null;
          }
        }, 50);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      heldKeys.current.delete(e.code);
      clearKeyTimers(e.code);
      const action = keyToAction[e.code];
      if (action === 'softDrop' && softDropInterval.current) {
        clearInterval(softDropInterval.current);
        softDropInterval.current = null;
      }
    };

    const onBlur = () => {
      clearHeldKeys();
      clearAllTimers();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      clearAllTimers();
      clearHeldKeys();
    };
  }, [active, keybinds, das, arr, handleAction, clearKeyTimers, clearAllTimers, clearHeldKeys]);
}
