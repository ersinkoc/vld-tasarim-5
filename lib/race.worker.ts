import { z as vz } from '@oxog/vld';
import { z } from 'zod';

// Same schemas, same data, same loop for both libraries. Measurement slices alternate
// between them so neither gets a warmer CPU or a quieter moment.
type Lib = typeof z;

const build = (lib: Lib) => ({
  email: lib.string().min(1).email(),
  integer: lib.number().int().positive(),
  union: lib.union([lib.string(), lib.number(), lib.boolean()]),
  optional: lib.string().optional(),
  object: lib.object({
    id: lib.number().int(),
    name: lib.string().min(2),
    email: lib.string().email(),
    active: lib.boolean(),
    tags: lib.array(lib.string()),
  }),
});

const DATA = {
  email: 'ada@lovelace.dev',
  integer: 42,
  union: true,
  optional: undefined,
  object: { id: 1, name: 'Ada', email: 'ada@lovelace.dev', active: true, tags: ['math', 'engines'] },
};

export type CaseKey = keyof typeof DATA;
export type RaceMessage =
  | { type: 'progress'; key: CaseKey; lib: 'vld' | 'zod'; ops: number; ms: number }
  | { type: 'case-done'; key: CaseKey }
  | { type: 'done' };

const schemas = { vld: build(vz as unknown as Lib), zod: build(z) };
const post = (m: RaceMessage) => self.postMessage(m);

function burn(schema: { safeParse: (v: unknown) => unknown }, data: unknown, ms: number) {
  let ops = 0;
  const start = performance.now();
  let now = start;
  while (now - start < ms) {
    for (let i = 0; i < 2000; i++) schema.safeParse(data);
    ops += 2000;
    now = performance.now();
  }
  return { ops, ms: now - start };
}

self.onmessage = (e: MessageEvent<{ keys: CaseKey[] }>) => {
  for (const key of e.data.keys) {
    const a = schemas.vld[key];
    const b = schemas.zod[key];
    const data = DATA[key];
    burn(a, data, 120);
    burn(b, data, 120);
    for (let slice = 0; slice < 8; slice++) {
      const order = slice % 2 === 0 ? (['vld', 'zod'] as const) : (['zod', 'vld'] as const);
      for (const lib of order) {
        const { ops, ms } = burn(lib === 'vld' ? a : b, data, 90);
        post({ type: 'progress', key, lib, ops, ms });
      }
    }
    post({ type: 'case-done', key });
  }
  post({ type: 'done' });
};
