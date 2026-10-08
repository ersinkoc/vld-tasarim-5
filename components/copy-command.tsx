'use client';

import { useState } from 'react';

export function CopyCommand({ command, className = '' }: { command: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={`group flex items-center gap-3 rounded-full border border-line bg-surface py-2.5 pl-4 pr-2.5 font-mono text-[13px] text-ink transition-colors hover:border-accent ${className}`}
      aria-label={`Copy command: ${command}`}
    >
      <span className="text-muted">$</span>
      <span>{command}</span>
      <span
        aria-live="polite"
        className={`rounded-full px-2.5 py-1 font-sans text-[12px] transition-colors ${
          copied ? 'bg-pass text-surface' : 'bg-sunken text-muted group-hover:text-ink'
        }`}
      >
        {copied ? 'Copied' : 'Copy'}
      </span>
    </button>
  );
}
