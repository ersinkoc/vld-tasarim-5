'use client';

import { useState } from 'react';
import { CopyCommand } from './copy-command';

const MANAGERS = [
  { name: 'npm', cmd: 'npm i @oxog/vld' },
  { name: 'pnpm', cmd: 'pnpm add @oxog/vld' },
  { name: 'yarn', cmd: 'yarn add @oxog/vld' },
  { name: 'bun', cmd: 'bun add @oxog/vld' },
];

export function InstallTabs() {
  const [i, setI] = useState(0);
  return (
    <div className="flex flex-col items-start gap-4">
      <div role="tablist" aria-label="Package manager" className="flex gap-1 rounded-full bg-on-accent/10 p-1">
        {MANAGERS.map((m, idx) => (
          <button
            key={m.name}
            role="tab"
            type="button"
            aria-selected={i === idx}
            onClick={() => setI(idx)}
            className="rounded-full px-3.5 py-1.5 text-[13px] text-on-accent/75 transition-colors hover:text-on-accent aria-selected:bg-on-accent aria-selected:text-accent"
          >
            {m.name}
          </button>
        ))}
      </div>
      <CopyCommand command={MANAGERS[i].cmd} className="border-transparent !text-[15px]" />
    </div>
  );
}
