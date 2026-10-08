# vld.oxog.dev

Landing page for [@oxog/vld](https://github.com/ersinkoc/vld), built with Next.js 16, React 19, Tailwind CSS 4 and Motion.

```bash
npm install
npm run dev            # http://localhost:3000
npm run build          # static production build
npm run check:latest   # fails if any dependency is behind its npm "latest" tag
```

Everything interactive on the page runs the real library in the browser: the hero gate, the
locale ribbon, the playground, and the Web Worker benchmark against Zod (`lib/race.worker.ts`).
