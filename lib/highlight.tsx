import type { ReactNode } from 'react';

// A deliberately small TypeScript highlighter: enough for the snippets on this page,
// so the site ships no highlighting runtime.
const KEYWORDS = new Set([
  'import', 'from', 'export', 'const', 'let', 'type', 'if', 'else', 'return', 'await',
  'async', 'function', 'new', 'typeof', 'as', 'true', 'false', 'null', 'undefined',
]);

const TOKEN =
  /(\/\/[^\n]*)|('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`)|(\b\d[\d_.]*n?\b)|([A-Za-z_$][\w$]*)(?=\s*\()|([A-Za-z_$][\w$]*)/g;

export function highlight(code: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of code.matchAll(TOKEN)) {
    const start = m.index ?? 0;
    if (start > last) out.push(code.slice(last, start));
    const [text, comment, str, num, fn, word] = m;
    let cls: string | null = null;
    if (comment) cls = 'tok-c';
    else if (str) cls = 'tok-s';
    else if (num) cls = 'tok-n';
    else if (fn) cls = KEYWORDS.has(fn) ? 'tok-k' : 'tok-f';
    else if (word && KEYWORDS.has(word)) cls = 'tok-k';
    out.push(cls ? <span key={i++} className={cls}>{text}</span> : text);
    last = start + text.length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}

export function Code({ code, className = '' }: { code: string; className?: string }) {
  return (
    <pre className={`overflow-x-auto text-[13px] leading-[1.75] ${className}`}>
      <code>{highlight(code)}</code>
    </pre>
  );
}
