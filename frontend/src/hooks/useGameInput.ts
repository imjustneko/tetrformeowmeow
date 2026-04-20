'use client';

import { useEffect, useRef, useCallback, type RefObject } from 'react';
import type { GameEngine } from '@/lib/game/engine';
import { useSettingsStore } from '@/store/settingsStore';

export type IrsInputRef = {
  rotateCWHeld: boolean;
  rotateCCWHeld: boolean;
  rotate180Held: boolean;
  tapIntent: null | 'cw' | 'ccw' | '180';
  tapAt: number;
};

export function createIrsInputRef(): IrsInputRef {
  return {
    rotateCWHeld: false,
    rotateCCWHeld: false,
    rotate180Held: false,
    tapIntent: null,
    tapAt: 0,
  };
}

export interface InputSoundCallbacks {
  onMove?: () => void;
  onRotate?: () => void;
  onSoftDrop?: () => void;
  onHardDrop?: () => void;
  onHold?: () => void;
}

export function useGameInput(
  engineRef: RefObject<GameEngine | null>,
  active: boolean,
  irsInputRef: RefObject<IrsInputRef>,
  sounds?: InputSoundCallbacks
) {
  const keybinds = useSettingsStore((s) => s.keybinds);

  const hardHoldTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heldKeys = useRef<Set<string>>(new Set());
  const dasTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const arrIntervals = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());
  const softDropInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearHardHold = useCallback(() => {
    if (hardHoldTimer.current) clearTimeout(hardHoldTimer.current);
    hardHoldTimer.current = null;
  }, []);

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

  const clearAll = useCallback(() => {
    dasTimers.current.forEach((t) => clearTimeout(t));
    arrIntervals.current.forEach((t) => clearInterval(t));
    dasTimers.current.clear();
    arrIntervals.current.clear();
    clearHardHold();
    if (softDropInterval.current) {
      clearInterval(softDropInterval.current);
      softDropInterval.current = null;
    }
  }, [clearHardHold]);

  const clearHeldKeys = useCallback(() => {
    heldKeys.current.clear();
  }, []);

  const handleAction = useCallback(
    (action: string) => {
      const engine = engineRef.current;
      if (!engine) return;
      switch (action) {
        case 'moveLeft':
          engine.moveLeft();
          sounds?.onMove?.();
          break;
        case 'moveRight':
          engine.moveRight();
          sounds?.onMove?.();
          break;
        case 'softDrop':
          engine.softDrop();
          break;
        case 'sonicSoftDrop':
          engine.sonicSoftDrop();
          break;
        case 'hardDrop':
          engine.hardDrop();
          sounds?.onHardDrop?.();
          break;
        case 'rotateClockwise':
          engine.rotateClockwise();
          sounds?.onRotate?.();
          break;
        case 'rotateCounter':
          engine.rotateCounter();
          sounds?.onRotate?.();
          break;
        case 'rotate180':
          engine.rotate180();
          sounds?.onRotate?.();
          break;
        case 'hold':
          engine.hold();
          sounds?.onHold?.();
          break;
        default:
          break;
      }
    },
    [engineRef, sounds]
  );

  useEffect(() => {
    if (!active) return;

    const keyToAction: Record<string, string> = {};
    for (const [action, key] of Object.entries(keybinds)) {
      keyToAction[key] = action;
    }

    const ir = () => irsInputRef.current;

    const setIrsTap = (intent: 'cw' | 'ccw' | '180') => {
      const r = ir();
      if (!r) return;
      r.tapIntent = intent;
      r.tapAt = performance.now();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      const action = keyToAction[e.code];
      if (!action) return;
      if (heldKeys.current.has(e.code)) return;
      heldKeys.current.add(e.code);

      const st = useSettingsStore.getState();

      if (action === 'rotateClockwise') {
        ir()!.rotateCWHeld = true;
        setIrsTap('cw');
        handleAction('rotateClockwise');
        return;
      }
      if (action === 'rotateCounter') {
        ir()!.rotateCCWHeld = true;
        setIrsTap('ccw');
        handleAction('rotateCounter');
        return;
      }
      if (action === 'rotate180') {
        ir()!.rotate180Held = true;
        setIrsTap('180');
        handleAction('rotate180');
        return;
      }
      if (action === 'hold') {
        handleAction('hold');
        return;
      }

      if (action === 'hardDrop') {
        if (st.handling.preventAccidentalHardDrop) {
          if (hardHoldTimer.current) return;
          /** ~12f @ 60Hz — tap Space will not lock; hold to hard-drop (TETR.IO-style). */
          hardHoldTimer.current = setTimeout(() => {
            hardHoldTimer.current = null;
            handleAction('hardDrop');
          }, 200);
        } else {
          handleAction('hardDrop');
        }
        return;
      }

      if (action === 'softDrop') {
        sounds?.onSoftDrop?.();
        if (st.softDropFactor <= 0) {
          handleAction('sonicSoftDrop');
        } else {
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
        return;
      }

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
          }, st.arr === 0 ? 1 : st.arr);
          arrIntervals.current.set(code, ai);
          dasTimers.current.delete(code);
        }, st.das);
        dasTimers.current.set(code, dasT);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const action = keyToAction[e.code];
      if (!action) return;

      heldKeys.current.delete(e.code);
      clearKeyTimers(e.code);

      const r = ir();
      if (r) {
        if (action === 'rotateClockwise') r.rotateCWHeld = false;
        if (action === 'rotateCounter') r.rotateCCWHeld = false;
        if (action === 'rotate180') r.rotate180Held = false;
      }

      if (action === 'hardDrop') {
        clearHardHold();
        return;
      }

      if (action === 'softDrop') {
        if (softDropInterval.current) {
          clearInterval(softDropInterval.current);
          softDropInterval.current = null;
        }
        return;
      }
    };

    window.addEventListener('keydown', onKeyDown, { capture: true });
    window.addEventListener('keyup', onKeyUp, { capture: true });
    const onBlur = () => {
      clearHeldKeys();
      clearAll();
    };
    window.addEventListener('blur', onBlur);

    return () => {
      window.removeEventListener('keydown', onKeyDown, { capture: true });
      window.removeEventListener('keyup', onKeyUp, { capture: true });
      window.removeEventListener('blur', onBlur);
      clearHeldKeys();
      clearAll();
    };
  }, [active, keybinds, handleAction, clearAll, clearHardHold, clearHeldKeys, clearKeyTimers, irsInputRef, sounds]);
}
