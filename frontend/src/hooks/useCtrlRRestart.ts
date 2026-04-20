'use client';

import { useEffect } from 'react';

type Options = {
  enabled: boolean;
  onRestart: () => void;
};

/**
 * In solo-like modes, map Ctrl+R / Cmd+R to in-game restart
 * instead of full browser reload.
 */
export function useCtrlRRestart({ enabled, onRestart }: Options): void {
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const isReload = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'r';
      if (!isReload) return;
      event.preventDefault();
      onRestart();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled, onRestart]);
}
