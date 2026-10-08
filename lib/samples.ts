import { v } from '@oxog/vld';

type Schema = { safeParse: (value: unknown) => { success: boolean; error?: { message: string } } };

export type Sample = {
  field: string;
  source: string;
  // A factory, not an instance: some vld checks capture their message when the schema
  // is built, so it has to be built after setLocale() to speak the right language.
  make: () => Schema;
  good: unknown[];
  bad: unknown[];
};

// Every value that crosses the hero gate is checked by these real schemas.
export const SAMPLES: Sample[] = [
  {
    field: 'email',
    source: 'z.string().email()',
    make: () => v.string().email(),
    good: ['ada@lovelace.dev', 'grace@hopper.io', 'linus@kernel.org', 'ersin@oxog.dev'],
    bad: ['ada@', 'not-an-email', '@oxog', 'hello@world'],
  },
  {
    field: 'age',
    source: 'z.number().int().positive()',
    make: () => v.number().int().positive(),
    good: [28, 41, 7, 63],
    bad: [-3, 2.5, 0, -40],
  },
  {
    field: 'username',
    source: 'z.string().min(3)',
    make: () => v.string().min(3),
    good: ['octocat', 'ersin', 'zodiac', 'mira'],
    bad: ['x', 'ab', 'q'],
  },
  {
    field: 'website',
    source: 'z.string().url()',
    make: () => v.string().url(),
    good: ['https://vld.oxog.dev', 'https://npmjs.com', 'https://github.com'],
    bad: ['vld dot dev', 'htp:/broken', 'just text'],
  },
  {
    field: 'id',
    source: 'z.string().uuid()',
    make: () => v.string().uuid(),
    good: ['3f1c9a5e-8b2d-4c71-9e0a-6d4b2f8c1a77', 'a8d2e4c0-17b9-4f3e-8a61-0c5d9e2b7f14'],
    bad: ['1234-abcd', 'uuid-goes-here'],
  },
  {
    field: 'role',
    source: "z.enum(['admin', 'user', 'guest'])",
    make: () => v.enum('admin', 'user', 'guest'),
    good: ['admin', 'user', 'guest'],
    bad: ['root', 'owner', 'superuser'],
  },
  {
    field: 'color',
    source: 'z.string().regex(/^#[0-9a-f]{6}$/i)',
    make: () => v.string().regex(/^#[0-9a-f]{6}$/i),
    good: ['#2633e8', '#34dbb0', '#ff6d61'],
    bad: ['blue', '#12', 'rgb(0,0,0)'],
  },
];

export function display(value: unknown): string {
  return typeof value === 'string' ? `"${value}"` : String(value);
}
