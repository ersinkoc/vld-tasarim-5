import { ThemeToggle } from './theme-toggle';

export const LINKS = {
  github: 'https://github.com/ersinkoc/vld',
  npm: 'https://www.npmjs.com/package/@oxog/vld',
  docs: 'https://github.com/ersinkoc/vld/tree/main/docs',
  changelog: 'https://github.com/ersinkoc/vld/blob/main/CHANGELOG.md',
};

const NAV = [
  { href: '#swap', label: 'Migrate' },
  { href: '#race', label: 'Benchmark' },
  { href: '#languages', label: 'Languages' },
  { href: '#toolkit', label: 'Toolkit' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-transparent bg-paper/75 backdrop-blur-md supports-[backdrop-filter]:bg-paper/60">
      <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-6 px-5 sm:px-8">
        <a
          href="#top"
          className="text-[22px] font-[850] leading-none text-ink"
          style={{ fontVariationSettings: "'wdth' 150" }}
          aria-label="vld home"
        >
          vld<span className="text-accent">.</span>
        </a>
        <nav aria-label="Sections" className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="rounded-full px-3 py-1.5 text-[14px] text-muted transition-colors hover:bg-surface hover:text-ink"
            >
              {n.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <a
            href={LINKS.docs}
            className="hidden rounded-full px-3 py-1.5 text-[14px] text-muted transition-colors hover:text-ink sm:block"
          >
            Docs
          </a>
          <a
            href={LINKS.github}
            className="flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-[14px] text-ink transition-colors hover:border-accent hover:text-accent"
          >
            <GitHubIcon />
            <span className="hidden sm:inline">GitHub</span>
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export function GitHubIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden="true">
      <path d="M8 0a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.06-.49.06-.49.8.06 1.23.83 1.23.83.72 1.22 1.87.87 2.33.67.07-.52.28-.87.5-1.07-1.78-.2-3.65-.89-3.65-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0 0 8 0Z" />
    </svg>
  );
}
