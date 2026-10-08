import { Wordmark } from './wordmark';
import { GateStream } from './gate-stream';
import { CopyCommand } from './copy-command';
import { LINKS } from './header';

export function Hero() {
  return (
    <section id="top" className="relative pt-10 sm:pt-16">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <div className="flex items-center gap-3 text-[13px] text-muted">
          <a
            href={LINKS.changelog}
            className="rounded-full border border-line bg-surface px-3 py-1 transition-colors hover:border-accent hover:text-ink"
          >
            v3.0.11 adds the Zod 4.6 <code className="text-[12px] text-ink">.validate()</code> API
          </a>
        </div>

        <div className="mt-6 sm:mt-8">
          <Wordmark />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 sm:mt-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <p className="max-w-[34ch] text-[clamp(1.25rem,2.2vw,1.6rem)] leading-[1.35] text-ink">
            Validation, with everything it didn&apos;t need removed. The Zod API you already write, zero
            dependencies, and about three times the speed.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <CopyCommand command="npm i @oxog/vld" />
            <a
              href="#swap"
              className="rounded-full bg-accent px-5 py-3 text-[14px] font-semibold text-on-accent transition-transform hover:-translate-y-0.5"
            >
              See the one-line migration
            </a>
          </div>
        </div>
      </div>

      <div className="mt-14 sm:mt-16">
        <GateStream />
      </div>
    </section>
  );
}
