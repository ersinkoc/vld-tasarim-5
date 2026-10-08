// Fails if any dependency is behind the npm "latest" dist-tag.
import { readFile } from 'node:fs/promises';

const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const all = { ...pkg.dependencies, ...pkg.devDependencies };

const rows = await Promise.all(
  Object.entries(all).map(async ([name, pinned]) => {
    const res = await fetch(`https://registry.npmjs.org/-/package/${name.replace('/', '%2f')}/dist-tags`);
    const { latest } = await res.json();
    return { name, pinned, latest, ok: pinned === latest };
  }),
);

for (const r of rows) console.log(`${r.ok ? 'ok ' : 'OLD'}  ${r.name.padEnd(24)} ${r.pinned.padEnd(10)} latest ${r.latest}`);
if (rows.some((r) => !r.ok)) process.exit(1);
