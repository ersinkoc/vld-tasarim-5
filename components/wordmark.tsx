'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

const LETTERS = [...'validate'].map((char, i) => ({ char, i, keep: i === 0 || i === 2 || i === 4 }));
const TILT = [0, -24, 0, 18, 0, -12, 30, -36];
const FALL = {
  y: '0.75em',
  opacity: 0,
  filter: 'blur(6px)',
  transition: { duration: 0.75, ease: [0.5, 0, 0.9, 0.4] as const },
};

type Phase = 'full' | 'flag' | 'drop' | 'wide';

// "validate", with everything it didn't need removed: the vowels get rejected,
// fall out, and the survivors stretch into the wordmark.
export function Wordmark() {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>('full');

  useEffect(() => {
    if (reduce) {
      setPhase('wide');
      return;
    }
    const timers = [
      window.setTimeout(() => setPhase('flag'), 700),
      window.setTimeout(() => setPhase('drop'), 1350),
      window.setTimeout(() => setPhase('wide'), 1900),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [reduce]);

  const shown = phase === 'full' || phase === 'flag' ? LETTERS : LETTERS.filter((l) => l.keep);
  const wide = phase === 'wide';

  return (
    <h1
      aria-label="vld"
      className="relative flex select-none items-end leading-[0.78] tracking-[-0.02em] text-ink"
      style={{
        fontSize: 'clamp(5.5rem, 21vw, 17.5rem)',
        fontVariationSettings: wide ? "'wdth' 150, 'wght' 860" : "'wdth' 54, 'wght' 900",
        transition: reduce ? 'none' : 'font-variation-settings 1100ms cubic-bezier(.2,.8,.2,1)',
      }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {shown.map((l) => (
          <motion.span
            key={l.i}
            aria-hidden="true"
            layout={reduce ? false : 'position'}
            className="inline-block origin-bottom"
            animate={{ color: !l.keep && phase === 'flag' ? 'var(--fail)' : 'var(--ink)' }}
            exit={reduce ? undefined : { ...FALL, rotate: TILT[l.i], transition: { ...FALL.transition, delay: l.i * 0.03 } }}
            transition={{ layout: { type: 'spring', stiffness: 260, damping: 28 }, color: { duration: 0.25 } }}
          >
            {l.char}
          </motion.span>
        ))}
      </AnimatePresence>
      <motion.span
        aria-hidden="true"
        className="mb-[0.06em] ml-[0.03em] inline-block size-[0.125em] rounded-full bg-accent"
        initial={false}
        animate={{ scale: wide ? 1 : 0, opacity: wide ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 420, damping: 18, delay: wide ? 0.55 : 0 }}
      />
    </h1>
  );
}
