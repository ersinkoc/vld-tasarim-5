'use client';

import { useEffect, useRef, useState } from 'react';
import type { CaseKey, RaceMessage } from '@/lib/race.worker';

const CASES: { key: CaseKey; schema: string; input: string }[] = [
  { key: 'email', schema: 'z.string().min(1).email()', input: '"ada@lovelace.dev"' },
  { key: 'integer', schema: 'z.number().int().positive()', input: '42' },
  { key: 'union', schema: 'z.union([z.string(), z.number(), z.boolean()])', input: 'true' },
  { key: 'optional', schema: 'z.string().optional()', input: 'undefined' },
  { key: 'object', schema: 'z.object({ id, name, email, active, tags })', input: '{ id: 1, name: "Ada", … }' },
];
const SLICES = 8;

type Tally = { ops: number; ms: number; slices: number };
type Row = { vld: Tally; zod: Tally; done: boolean };
type Status = 'idle' | 'running' | 'done';

const empty = (): Record<CaseKey, Row> =>
  Object.fromEntries(
    CASES.map((c) => [c.key, { vld: { ops: 0, ms: 0, slices: 0 }, zod: { ops: 0, ms: 0, slices: 0 }, done: false }]),
  ) as Record<CaseKey, Row>;

const rate = (t: Tally) => (t.ms ? (t.ops / t.ms) * 1000 : 0);
const fmt = (n: number) =>
  n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(0)}K` : n ? n.toFixed(0) : '—';

export function Race() {
  const [rows, setRows] = useState(empty);
  const [status, setStatus] = useState<Status>('idle');
  const worker = useRef<Worker | null>(null);

  useEffect(() => () => worker.current?.terminate(), []);

  const run = () => {
    worker.current?.terminate();
    setRows(empty());
    setStatus('running');
    const w = new Worker(new URL('../lib/race.worker.ts', import.meta.url), { type: 'module' });
    worker.current = w;
    w.onmessage = (e: MessageEvent<RaceMessage>) => {
      const m = e.data;
      if (m.type === 'done') {
        setStatus('done');
        w.terminate();
        return;
      }
      setRows((prev) => {
        const row = prev[m.key];
        const next =
          m.type === 'case-done'
            ? { ...row, done: true }
            : { ...row, [m.lib]: { ops: row[m.lib].ops + m.ops, ms: row[m.lib].ms + m.ms, slices: row[m.lib].slices + 1 } };
        return { ...prev, [m.key]: next };
      });
    };
    w.postMessage({ keys: CASES.map((c) => c.key) });
  };

  const finished = CASES.map((c) => rows[c.key]).filter((r) => r.done);
  const geomean =
    finished.length > 0
      ? Math.exp(finished.reduce((s, r) => s + Math.log(rate(r.vld) / rate(r.zod)), 0) / finished.length)
      : 0;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={run}
          disabled={status === 'running'}
          className="rounded-full bg-accent px-6 py-3 text-[15px] font-semibold text-on-accent transition-transform enabled:hover:-translate-y-0.5 disabled:opacity-60"
        >
          {status === 'idle' ? 'Run the benchmark in this browser' : status === 'running' ? 'Running…' : 'Run it again'}
        </button>
        <p className="text-[14px] text-muted" aria-live="polite">
          {status === 'idle' && 'Takes about ten seconds. Runs in a Web Worker, so the page stays responsive.'}
          {status === 'running' && `Measuring case ${Math.min(finished.length + 1, CASES.length)} of ${CASES.length}…`}
          {status === 'done' && (
            <>
              On this device vld was <strong className="text-ink">{geomean.toFixed(2)}×</strong> as fast as Zod
              (geometric mean of {CASES.length} cases).
            </>
          )}
        </p>
      </div>

      <ol className="mt-10 divide-y divide-line border-y border-line">
        {CASES.map((c) => {
          const row = rows[c.key];
          const a = rate(row.vld);
          const b = rate(row.zod);
          const lead = Math.max(row.vld.ops, row.zod.ops) || 1;
          const progress = Math.max(row.vld.slices, row.zod.slices) / SLICES;
          const ratio = a && b ? a / b : 0;
          return (
            <li key={c.key} className="grid grid-cols-1 gap-4 py-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)_7rem] md:items-center">
              <div className="min-w-0">
                <code className="block truncate text-[13px] text-ink">{c.schema}</code>
                <span className="mt-1 block font-mono text-[11.5px] text-muted">input {c.input}</span>
              </div>
              <div className="flex flex-col gap-2">
                {(['vld', 'zod'] as const).map((lib) => (
                  <div key={lib} className="flex items-center gap-3">
                    <span className={`w-8 shrink-0 text-[12px] ${lib === 'vld' ? 'text-accent' : 'text-muted'}`}>{lib}</span>
                    <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-sunken">
                      <div
                        className={`absolute inset-y-0 left-0 rounded-full transition-[width] duration-150 ease-linear ${
                          lib === 'vld' ? 'bg-accent' : 'bg-muted/60'
                        }`}
                        style={{ width: `${(row[lib].ops / lead) * progress * 100}%` }}
                      />
                    </div>
                    <span className="w-20 shrink-0 text-right font-mono text-[11.5px] tabular-nums text-muted">
                      {fmt(row[lib].slices ? rate(row[lib]) : 0)}
                      {row[lib].slices ? '/s' : ''}
                    </span>
                  </div>
                ))}
              </div>
              <div className="text-left md:text-right">
                <span
                  className={`text-[clamp(1.5rem,2.6vw,2.1rem)] font-[800] tabular-nums leading-none ${
                    !row.done ? 'text-line' : ratio >= 1 ? 'text-ink' : 'text-fail'
                  }`}
                  style={{ fontVariationSettings: "'wdth' 120" }}
                >
                  {row.done ? `${ratio.toFixed(1)}×` : '—'}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
