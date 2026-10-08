import { Header, LINKS, GitHubIcon } from '@/components/header';
import { Hero } from '@/components/hero';
import { DotField } from '@/components/dot-field';
import { LocaleRibbon } from '@/components/locale-ribbon';
import { Swap } from '@/components/swap';
import { Race } from '@/components/race';
import { Playground } from '@/components/playground';
import { Toolkit } from '@/components/toolkit';
import { InstallTabs } from '@/components/install-tabs';

const PARITY = [
  <>Every public Zod 4.6 export, all 259 of them, is checked against each release.</>,
  <>A 1,400-case behavior sweep compares results with the installed zod.</>,
  <>
    Zod&apos;s entry points are mirrored: <code>/v4</code>, <code>/v4-mini</code>, <code>/v4/core</code>,{' '}
    <code>/v4/locales</code>.
  </>,
  <>
    <code>toZodError()</code> hands existing tooling the ZodError shape, with <code>.format()</code> and{' '}
    <code>.flatten()</code>.
  </>,
];

// Release-gated ratios from the vld README (Node, measured in CI against Zod).
const CI = [
  { name: 'Nullish', ratio: 30.7 },
  { name: 'Positive integer', ratio: 9.1 },
  { name: 'Discriminated union', ratio: 4.1 },
  { name: 'Optional', ratio: 3.8 },
  { name: 'Union', ratio: 3.3 },
  { name: 'Simple string', ratio: 3.0 },
  { name: 'Array and object', ratio: 1.7 },
];
const CI_MAX = Math.log(32);

function Heading({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2
      id={id}
      className="max-w-[20ch] text-[clamp(2.3rem,4.8vw,4.1rem)] font-[820] leading-[0.98] tracking-[-0.015em] text-ink"
      style={{ fontVariationSettings: "'wdth' 108" }}
    >
      {children}
    </h2>
  );
}

export default function Page() {
  return (
    <>
      <DotField />
      <Header />
      <main>
        <Hero />

        <div className="mt-16">
          <LocaleRibbon />
        </div>

        <section id="swap" className="scroll-mt-16 bg-paper py-24 sm:py-32">
          <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-14 px-5 sm:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
            <div>
              <Heading>Change one line. Keep the rest.</Heading>
              <p className="mt-6 max-w-[46ch] text-[17px] leading-relaxed text-muted">
                vld follows Zod&apos;s API and error shapes, so moving over means pointing your import at a new package.
                Schemas, inferred types and error handling stay as they are.
              </p>
              <ul className="mt-10 flex flex-col gap-4">
                {PARITY.map((item, i) => (
                  <li key={i} className="flex gap-3 text-[15.5px] leading-relaxed text-ink [&_code]:text-[13px] [&_code]:text-accent">
                    <span className="mt-[5px] grid size-[18px] shrink-0 place-items-center rounded-full bg-pass text-[10px] text-surface" aria-hidden="true">
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:pt-4">
              <Swap />
            </div>
          </div>
        </section>

        <section id="race" className="scroll-mt-16 py-24 sm:py-32">
          <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-end">
              <Heading>Don&apos;t take our numbers. Make your own.</Heading>
              <p className="max-w-[44ch] text-[17px] leading-relaxed text-muted">
                Both libraries are bundled into this page. The button runs the same schemas on the same data, alternating
                between them in short slices, on your hardware.
              </p>
            </div>
            <div className="mt-12 rounded-[28px] border border-line bg-paper/80 p-5 backdrop-blur-sm sm:p-8">
              <Race />
            </div>

            <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
              <div>
                <h3 className="text-[22px] font-[760] text-ink" style={{ fontVariationSettings: "'wdth' 110" }}>
                  What CI holds every release to
                </h3>
                <p className="mt-3 max-w-[40ch] text-[15px] leading-relaxed text-muted">
                  Speed ratios against Zod on Node. A release that falls below its floor doesn&apos;t ship.
                </p>
              </div>
              <ul className="flex flex-col gap-3">
                {CI.map((c) => (
                  <li key={c.name} className="grid grid-cols-[9.5rem_1fr_3.5rem] items-center gap-4 text-[14px] sm:grid-cols-[12rem_1fr_4rem]">
                    <span className="text-ink">{c.name}</span>
                    <span className="h-[3px] rounded-full bg-line">
                      <span
                        className="block h-full rounded-full bg-accent"
                        style={{ width: `${(Math.log(c.ratio) / CI_MAX) * 100}%` }}
                      />
                    </span>
                    <span className="text-right font-mono text-[12.5px] tabular-nums text-ink">{c.ratio.toFixed(1)}×</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="languages" className="scroll-mt-16 border-t border-line bg-paper py-24 sm:py-32">
          <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-end">
              <Heading>Errors your users can actually read.</Heading>
              <p className="max-w-[44ch] text-[17px] leading-relaxed text-muted">
                32 locales ship with the package, from Türkçe to Kiswahili. Load them lazily with{' '}
                <code className="text-[14px] text-ink">setLocaleAsync()</code> and only the language you use ends up in
                the bundle.
              </p>
            </div>
            <div className="mt-12">
              <Playground />
            </div>
          </div>
        </section>

        <section id="toolkit" className="scroll-mt-16 border-t border-line bg-paper py-24 sm:py-32">
          <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
            <Heading>More than parse and safeParse.</Heading>
            <div className="mt-12">
              <Toolkit />
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-accent text-on-accent">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-[0.22em] right-[-0.04em] select-none text-[clamp(10rem,34vw,30rem)] font-[900] leading-none text-on-accent/10"
            style={{ fontVariationSettings: "'wdth' 150" }}
          >
            vld.
          </div>
          <div className="relative mx-auto max-w-[1240px] px-5 py-24 sm:px-8 sm:py-32">
            <h2
              className="max-w-[14ch] text-[clamp(2.6rem,6vw,5.4rem)] font-[850] leading-[0.92]"
              style={{ fontVariationSettings: "'wdth' 125" }}
            >
              Swap the import. Ship lighter.
            </h2>
            <p className="mt-6 max-w-[44ch] text-[17px] leading-relaxed text-on-accent/80">
              MIT licensed, zero dependencies, Node 18 and up, every modern browser.
            </p>
            <div className="mt-10">
              <InstallTabs />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-paper">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-5 py-10 text-[14px] text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>
            <span className="font-[850] text-ink" style={{ fontVariationSettings: "'wdth' 150" }}>
              vld<span className="text-accent">.</span>
            </span>{' '}
            Built by{' '}
            <a href="https://github.com/ersinkoc" className="text-ink underline decoration-line underline-offset-4 hover:decoration-accent">
              Ersin Koç
            </a>
            . MIT licensed.
          </p>
          <nav aria-label="Project links" className="flex flex-wrap items-center gap-5">
            <a href={LINKS.docs} className="hover:text-ink">Docs</a>
            <a href={LINKS.changelog} className="hover:text-ink">Changelog</a>
            <a href={LINKS.npm} className="hover:text-ink">npm</a>
            <a href={LINKS.github} className="flex items-center gap-1.5 hover:text-ink">
              <GitHubIcon /> GitHub
            </a>
          </nav>
        </div>
      </footer>
    </>
  );
}
