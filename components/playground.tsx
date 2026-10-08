'use client';

import { useMemo, useState } from 'react';
import { getSupportedLocales, setLocale, v, type Locale } from '@oxog/vld';
import { LOCALE_NAMES, RTL } from '@/lib/locales';
import { highlight } from '@/lib/highlight';

type FieldSchema = { safeParse: (value: unknown) => { success: boolean; error?: { message: string } } };

const PRESETS = {
  signup: {
    label: 'Sign-up form',
    source: `z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().int().positive(),
  website: z.string().url().optional(),
})`,
    fields: {
      name: () => v.string().min(2),
      email: () => v.string().email(),
      age: () => v.number().int().positive(),
      website: () => v.string().url().optional(),
    } as Record<string, () => FieldSchema>,
    input: `{
  "name": "A",
  "email": "ada@lovelace",
  "age": -36,
  "website": "lovelace dot dev"
}`,
  },
  order: {
    label: 'Order payload',
    source: `z.object({
  id: z.string().uuid(),
  sku: z.string().regex(/^[A-Z]{3}-\\d{4}$/),
  quantity: z.number().int().min(1).max(99),
  status: z.enum(['paid', 'shipped', 'refunded']),
})`,
    fields: {
      id: () => v.string().uuid(),
      sku: () => v.string().regex(/^[A-Z]{3}-\d{4}$/),
      quantity: () => v.number().int().min(1).max(99),
      status: () => v.enum('paid', 'shipped', 'refunded'),
    } as Record<string, () => FieldSchema>,
    input: `{
  "id": "order-42",
  "sku": "vld-0001",
  "quantity": 120,
  "status": "lost"
}`,
  },
} as const;

type PresetKey = keyof typeof PRESETS;
type Outcome =
  | { kind: 'syntax'; message: string }
  | { kind: 'issues'; issues: { path: string; message: string }[] }
  | { kind: 'ok'; data: unknown };

function check(preset: PresetKey, text: string, locale: Locale): Outcome {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (e) {
    return { kind: 'syntax', message: (e as Error).message };
  }
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return { kind: 'syntax', message: 'The input must be a JSON object.' };
  }
  const record = data as Record<string, unknown>;
  setLocale(locale);
  const issues = Object.entries(PRESETS[preset].fields).flatMap(([path, schema]) => {
    const r = schema().safeParse(record[path]);
    return r.success ? [] : [{ path, message: r.error?.message ?? 'Invalid' }];
  });
  setLocale('en');
  return issues.length ? { kind: 'issues', issues } : { kind: 'ok', data };
}

export function Playground() {
  const locales = useMemo(() => getSupportedLocales(), []);
  const [preset, setPreset] = useState<PresetKey>('signup');
  const [locale, setLoc] = useState<Locale>('tr');
  const [text, setText] = useState<string>(PRESETS.signup.input);
  const outcome = check(preset, text, locale);
  const rtl = RTL.has(locale);

  const choose = (key: PresetKey) => {
    setPreset(key);
    setText(PRESETS[key].input);
  };

  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-[22px] border border-line bg-surface lg:grid-cols-2">
      <div className="flex flex-col border-b border-line lg:border-b-0 lg:border-r">
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
          {(Object.keys(PRESETS) as PresetKey[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => choose(k)}
              aria-pressed={preset === k}
              className="rounded-full px-3 py-1 text-[13px] text-muted transition-colors hover:text-ink aria-pressed:bg-accent-soft aria-pressed:text-ink"
            >
              {PRESETS[k].label}
            </button>
          ))}
        </div>
        <pre className="overflow-x-auto bg-sunken/50 px-5 py-4 text-[12.5px] leading-[1.75]">
          <code>{highlight(PRESETS[preset].source)}</code>
        </pre>
        <label className="flex flex-1 flex-col border-t border-line">
          <span className="px-5 pt-3 text-[12px] text-muted">Input, edit freely</span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
            rows={7}
            className="mono w-full flex-1 resize-none bg-transparent px-5 pb-5 pt-2 text-[13px] leading-[1.75] text-ink outline-none"
          />
        </label>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <span className="text-[13px] text-muted">Messages in</span>
          <select
            value={locale}
            onChange={(e) => setLoc(e.target.value as Locale)}
            className="rounded-full border border-line bg-surface px-3 py-1 text-[13px] text-ink"
            aria-label="Error message language"
          >
            {locales.map((l) => (
              <option key={l} value={l}>
                {LOCALE_NAMES[l] ?? l} ({l})
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 px-5 py-5" aria-live="polite">
          {outcome.kind === 'syntax' && (
            <p className="text-[14px] text-fail">That isn&apos;t valid JSON yet: {outcome.message}</p>
          )}
          {outcome.kind === 'ok' && (
            <div>
              <p className="flex items-center gap-2 text-[15px] font-semibold text-pass">
                <span className="grid size-5 place-items-center rounded-full bg-pass text-[11px] text-surface">✓</span>
                Parsed. Every field passed.
              </p>
              <pre className="mt-4 text-[12.5px] leading-[1.75] text-muted">
                <code>{JSON.stringify(outcome.data, null, 2)}</code>
              </pre>
            </div>
          )}
          {outcome.kind === 'issues' && (
            <ul className="flex flex-col gap-3">
              {outcome.issues.map((i) => (
                <li key={i.path} className="grid grid-cols-[6rem_1fr] items-baseline gap-3 border-b border-line pb-3 last:border-0">
                  <code className="truncate text-[12.5px] text-fail">{i.path}</code>
                  <span dir={rtl ? 'rtl' : undefined} className="text-[15px] leading-snug text-ink">
                    {i.message}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="border-t border-line px-5 py-3 text-[12px] text-muted">
          Messages come from <code className="text-ink">setLocale(&apos;{locale}&apos;)</code>. Fix the input and watch
          them clear.
        </p>
      </div>
    </div>
  );
}
