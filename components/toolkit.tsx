'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { highlight } from '@/lib/highlight';

const TOOLS = [
  {
    name: 'Boolean checks',
    note: 'Zod 4.6’s .validate() answers yes or no without building a result object. vld compiles the schema ahead of time on first call.',
    code: `const isUser = userSchema.validate(payload);   // true | false

// Async refinements work too
await userSchema.validateAsync(payload);`,
  },
  {
    name: 'Mini API',
    note: 'Standalone functions for bundles where every kilobyte counts. Import only what you use.',
    code: `import { string, number, object, optional, array } from '@oxog/vld/mini';

const user = object({
  name: string().min(2),
  age: optional(number().positive()),
  roles: array(string()),
});`,
  },
  {
    name: 'Codecs',
    note: 'Decode and encode with the same schema. Nineteen codecs ship built in.',
    code: `import { stringToNumber, jsonCodec, base64ToBytes } from '@oxog/vld';

stringToNumber.parse('42');    // 42
stringToNumber.encode(42);     // '42'

const bytes = base64ToBytes.parse('SGVsbG8=');`,
  },
  {
    name: 'Result pattern',
    note: 'Handle failure as a value instead of a thrown exception.',
    code: `import { tryCatch, match } from '@oxog/vld';

const result = tryCatch(() => JSON.parse(raw));

const label = match(result, {
  ok: (data) => \`Loaded \${data.id}\`,
  err: (error) => \`Failed: \${error.message}\`,
});`,
  },
  {
    name: 'Coercion',
    note: 'Accept strings from forms and query strings, get real types out.',
    code: `v.coerce.number().parse('42');          // 42
v.coerce.boolean().parse('true');       // true
v.coerce.date().parse('2026-10-08');    // Date`,
  },
  {
    name: 'Error formats',
    note: 'Flat for forms, a tree for UIs, pretty for terminals, ZodError-shaped for existing tooling.',
    code: `import { flattenError, treeifyError, prettifyError, toZodError } from '@oxog/vld';

const { fieldErrors } = flattenError(result.error);
console.log(prettifyError(result.error));
toZodError(result.error).format();`,
  },
  {
    name: 'Plugins',
    note: 'Register your own validators once and use them everywhere.',
    code: `import { definePlugin, usePlugin, v } from '@oxog/vld';

usePlugin(definePlugin({
  name: 'phone-validator',
  version: '1.0.0',
  validators: {
    phone: () => v.string().regex(/^\\+?[1-9]\\d{1,14}$/),
  },
}));`,
  },
];

export function Toolkit() {
  const [active, setActive] = useState(0);
  const tool = TOOLS[active];

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14">
      <div role="tablist" aria-label="Toolkit" className="flex flex-col">
        {TOOLS.map((t, i) => (
          <button
            key={t.name}
            role="tab"
            type="button"
            aria-selected={active === i}
            aria-controls="toolkit-panel"
            onClick={() => setActive(i)}
            className="group relative flex items-center justify-between border-b border-line py-4 text-left first:border-t"
          >
            <span
              className="text-[clamp(1.25rem,2vw,1.6rem)] font-[750] text-muted transition-[color,font-variation-settings] duration-300 group-hover:text-ink group-aria-selected:text-ink"
              style={{ fontVariationSettings: active === i ? "'wdth' 130" : "'wdth' 92" }}
            >
              {t.name}
            </span>
            {active === i && (
              <motion.span layoutId="toolkit-dot" className="size-2.5 rounded-full bg-accent" aria-hidden="true" />
            )}
          </button>
        ))}
      </div>

      <div id="toolkit-panel" role="tabpanel" className="min-w-0">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            <p className="max-w-[52ch] text-[17px] leading-relaxed text-ink">{tool.note}</p>
            <div className="mt-6 overflow-hidden rounded-[22px] border border-line bg-surface">
              <pre className="overflow-x-auto px-5 py-5 text-[13px] leading-[1.75]">
                <code>{highlight(tool.code)}</code>
              </pre>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
