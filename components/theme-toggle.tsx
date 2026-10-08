'use client';

import { useSyncExternalStore, type MouseEvent } from 'react';
import { flushSync } from 'react-dom';

type Theme = 'light' | 'dark';

const subscribe = (notify: () => void) => {
  const mo = new MutationObserver(notify);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => mo.disconnect();
};
const read = (): Theme => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, read, () => 'light' as Theme);
  const next: Theme = theme === 'dark' ? 'light' : 'dark';

  const toggle = (e: MouseEvent<HTMLButtonElement>) => {
    const apply = () => {
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem('theme', next);
      } catch {}
    };
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!document.startViewTransition || reduce) return apply();

    // Reveal the new theme as a circle growing out of the button.
    const { clientX: x, clientY: y } = e;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const vt = document.startViewTransition(() => flushSync(apply));
    vt.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 700, easing: 'cubic-bezier(.2,.8,.2,1)', pseudoElement: '::view-transition-new(root)' },
      );
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className="grid size-9 place-items-center rounded-full border border-line text-ink transition-colors hover:border-accent hover:text-accent"
    >
      <svg viewBox="0 0 20 20" className="size-[18px]" aria-hidden="true">
        <circle cx="10" cy="10" r="7.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M10 2.75a7.25 7.25 0 0 1 0 14.5Z"
          fill="currentColor"
          className="origin-center transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)]"
          style={{ transform: theme === 'dark' ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </svg>
    </button>
  );
}
