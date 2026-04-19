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

export function useGameInput(
  engineRef: RefObject<GameEngine | null>,
  active: boolean,
  irsInputRef: RefObject<IrsInputRef>
) {
  const keybinds = useSettingsStore((s) => s.keybinds);

  const softTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hardHoldTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dasTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dcdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const arrTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const leftHeld = useRef(false);
  const rightHeld = useRef(false);
  const downHeld = useRef(false);
  const activeHoriz = useRef<'left' | 'right' | null>(null);

  const clearSoft = useCallback(() => {
    if (softTimer.current) clearTimeout(softTimer.current);
    softTimer.current = null;
  }, []);

  const clearHardHold = useCallback(() => {
    if (hardHoldTimer.current) clearTimeout(hardHoldTimer.current);
    hardHoldTimer.current = null;
  }, []);

  const clearHoriz = useCallback(() => {
    if (dasTimer.current) clearTimeout(dasTimer.current);
    if (dcdTimer.current) clearTimeout(dcdTimer.current);
    if (arrTimer.current) clearTimeout(arrTimer.current);
    dasTimer.current = null;
    dcdTimer.current = null;
    arrTimer.current = null;
    activeHoriz.current = null;
  }, []);

  const clearAll = useCallback(() => {
    clearSoft();
    clearHardHold();
    clearHoriz();
  }, [clearSoft, clearHardHold, clearHoriz]);

  const handleAction = useCallback(
    (action: string) => {
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
        case 'sonicSoftDrop':
          engine.sonicSoftDrop();
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
        default:
          break;
      }
    },
    [engineRef]
  );

  const scheduleArr = useCallback(
    (action: 'moveLeft' | 'moveRight') => {
      const step = () => {
        const st = useSettingsStore.getState();
        const delay = Math.max(1, st.arr <= 0 ? 1 : st.arr);
        arrTimer.current = setTimeout(() => {
          if (!engineRef.current) return;
          const st2 = useSettingsStore.getState();
          if (st2.handling.preferSoftDropOverMovement && downHeld.current) {
            step();
            return;
          }
          handleAction(action);
          step();
        }, delay);
      };
      step();
    },
    [engineRef, handleAction]
  );

  const beginHorizontal = useCallback(
    (dir: 'left' | 'right') => {
      const st = useSettingsStore.getState();
      if (st.handling.preferSoftDropOverMovement && downHeld.current) return;

      clearHoriz();
      activeHoriz.current = dir;

      const otherHeld = dir === 'left' ? rightHeld.current : leftHeld.current;
      const dcdMs =
        st.handling.cancelDASOnDirectionChange && otherHeld ? 0 : otherHeld ? st.handling.dcd : 0;

      const startDas = () => {
        const s2 = useSettingsStore.getState();
        const d = Math.max(0, s2.das);
        dasTimer.current = setTimeout(() => {
          scheduleArr(dir === 'left' ? 'moveLeft' : 'moveRight');
        }, d);
      };

      if (dcdMs > 0) {
        dcdTimer.current = setTimeout(startDas, dcdMs);
      } else {
        startDas();
      }
    },
    [clearHoriz, scheduleArr]
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
      if (e.repeat && (action === 'moveLeft' || action === 'moveRight' || action === 'softDrop')) {
        return;
      }

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
        if (e.repeat) return;
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
        downHeld.current = true;
        if (st.softDropFactor <= 0) {
          handleAction('sonicSoftDrop');
        } else {
          clearSoft();
          const ms = Math.max(2, Math.floor(520 / Math.max(1, st.softDropFactor)));
          const tick = () => {
            handleAction('softDrop');
            softTimer.current = setTimeout(tick, ms);
          };
          tick();
        }
        return;
      }

      if (action === 'moveLeft') {
        leftHeld.current = true;
        handleAction('moveLeft');
        clearHoriz();
        beginHorizontal('left');
        return;
      }

      if (action === 'moveRight') {
        rightHeld.current = true;
        handleAction('moveRight');
        clearHoriz();
        beginHorizontal('right');
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const action = keyToAction[e.code];
      if (!action) return;

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
        downHeld.current = false;
        clearSoft();
        if (leftHeld.current) {
          clearHoriz();
          beginHorizontal('left');
        } else if (rightHeld.current) {
          clearHoriz();
          beginHorizontal('right');
        }
        return;
      }

      if (action === 'moveLeft') {
        leftHeld.current = false;
        if (activeHoriz.current === 'left') clearHoriz();
        if (rightHeld.current) beginHorizontal('right');
        return;
      }

      if (action === 'moveRight') {
        rightHeld.current = false;
        if (activeHoriz.current === 'right') clearHoriz();
        if (leftHeld.current) beginHorizontal('left');
      }
    };

    window.addEventListener('keydown', onKeyDown, { capture: true });
    window.addEventListener('keyup', onKeyUp, { capture: true });
    const onBlur = () => {
      leftHeld.current = false;
      rightHeld.current = false;
      downHeld.current = false;
      clearAll();
    };
    window.addEventListener('blur', onBlur);

    return () => {
      window.removeEventListener('keydown', onKeyDown, { capture: true });
      window.removeEventListener('keyup', onKeyUp, { capture: true });
      window.removeEventListener('blur', onBlur);
      leftHeld.current = false;
      rightHeld.current = false;
      downHeld.current = false;
      clearAll();
    };
  }, [active, keybinds, handleAction, clearAll, clearSoft, clearHoriz, clearHardHold, beginHorizontal, engineRef, irsInputRef]);
}
