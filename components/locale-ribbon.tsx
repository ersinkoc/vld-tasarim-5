import { getSupportedLocales, setLocale, v } from '@oxog/vld';
import { RTL } from '@/lib/locales';

type Line = { locale: string; message: string };

// Built at render time from the library itself, so every line is a real message vld emits.
function collect(): [Line[], Line[]] {
  const probes = [
    () => v.string().email().safeParse('ada@'),
    () => v.string().min(3).safeParse('x'),
    () => v.number().positive().safeParse(-3),
    () => v.string().url().safeParse('vld dot dev'),
  ];
  const top: Line[] = [];
  const bottom: Line[] = [];
  getSupportedLocales().forEach((locale, i) => {
    setLocale(locale);
    const a = probes[i % probes.length]().error?.message;
    const b = probes[(i + 2) % probes.length]().error?.message;
    if (a) top.push({ locale, message: a });
    if (b) bottom.push({ locale, message: b });
  });
  setLocale('en');
  return [top, bottom];
}

function Row({ lines, reverse }: { lines: Line[]; reverse?: boolean }) {
  const items = [...lines, ...lines];
  return (
    <div className="mask-x overflow-hidden">
      <ul
        className={`marquee flex w-max gap-10 ${reverse ? 'marquee-reverse' : ''}`}
        style={{ ['--marquee-duration' as string]: `${lines.length * 3.2}s` }}
      >
        {items.map((l, i) => (
          <li key={i} aria-hidden={i >= lines.length} className="flex shrink-0 items-baseline gap-3 whitespace-nowrap">
            <span className="font-mono text-[11px] text-accent">{l.locale}</span>
            <span dir={RTL.has(l.locale) ? 'rtl' : undefined} className="text-[clamp(1.05rem,1.8vw,1.4rem)] text-ink">
              {l.message}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LocaleRibbon() {
  const [top, bottom] = collect();
  return (
    <section aria-label="Error messages in every supported locale" className="border-y border-line bg-surface py-7">
      <div className="flex flex-col gap-4">
        <Row lines={top} />
        <Row lines={bottom} reverse />
      </div>
    </section>
  );
}
