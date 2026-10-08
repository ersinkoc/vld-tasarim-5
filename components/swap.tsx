'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'motion/react';
import { highlight } from '@/lib/highlight';

const FROM = 'zod';
const TO = '@oxog/vld';

const BODY = `
const signup = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
  role: z.enum(['admin', 'user', 'guest']).default('user'),
});

type Signup = z.infer<typeof signup>;

const result = signup.safeParse(input);
if (!result.success) {
  console.log(result.error.flatten().fieldErrors);
}`;

// Erase "zod" and type "@oxog/vld", one key at a time.
function frames() {
  const out: string[] = [];
  for (let i = FROM.length; i >= 0; i--) out.push(FROM.slice(0, i));
  for (let i = 1; i <= TO.length; i++) out.push(TO.slice(0, i));
  return out;
}
const FRAMES = frames();

export function Swap() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-30% 0px' });
  const reduce = useReducedMotion();
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setFrame(FRAMES.length - 1);
      return;
    }
    let i = 0;
    const start = window.setTimeout(function tick() {
      i++;
      setFrame(i);
      if (i < FRAMES.length - 1) timer = window.setTimeout(tick, i < FROM.length ? 110 : 75);
    }, 500);
    let timer = start;
    return () => window.clearTimeout(timer);
  }, [inView, reduce]);

  const pkg = FRAMES[frame];
  const done = frame === FRAMES.length - 1;

  return (
    <div ref={ref} className="overflow-hidden rounded-[22px] border border-line bg-surface">
      <div className="flex items-center justify-between border-b border-line px-5 py-3 text-[12px] text-muted">
        <span className="font-mono">signup.ts</span>
        <span className={`transition-colors duration-500 ${done ? 'text-pass' : ''}`}>
          {done ? '1 line changed, 12 untouched' : 'editing'}
        </span>
      </div>
      <pre className="overflow-x-auto px-5 py-5 text-[13px] leading-[1.75]">
        <code>
          <span
            className={`-mx-5 block px-5 transition-colors duration-500 ${done ? 'bg-accent-soft' : ''}`}
          >
            <span className="tok-k">import</span> {'{ z }'} <span className="tok-k">from</span>{' '}
            <span className="tok-s">
              &apos;{pkg}
              {!done && <span className="ml-px inline-block h-[1.1em] w-[2px] translate-y-[3px] animate-pulse bg-accent" />}
              &apos;
            </span>
            ;
          </span>
          {highlight(BODY)}
        </code>
      </pre>
    </div>
  );
}
