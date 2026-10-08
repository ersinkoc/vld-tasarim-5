'use client';

import { useEffect, useRef } from 'react';

// A quiet dot grid behind the page. Dots near the pointer swell and take the accent
// color, as if the field were checking whatever passes over it.
export function DotField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const GAP = 26;
    const RADIUS = 150;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let px = -9999;
    let py = -9999;
    let tx = -9999;
    let ty = -9999;
    let raf = 0;
    let colors = { dot: '#b9bfdc', accent: '#2633e8' };

    const readColors = () => {
      const s = getComputedStyle(document.documentElement);
      colors = { dot: s.getPropertyValue('--dot').trim(), accent: s.getPropertyValue('--accent').trim() };
    };

    const resize = () => {
      dpr = Math.min(2, devicePixelRatio || 1);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      px += (tx - px) * 0.14;
      py += (ty - py) * 0.14;
      ctx.clearRect(0, 0, w, h);
      const offsetY = -(scrollY % GAP);
      for (let y = offsetY; y < h + GAP; y += GAP) {
        for (let x = GAP / 2; x < w; x += GAP) {
          const d = Math.hypot(x - px, y - py);
          const k = d < RADIUS ? 1 - d / RADIUS : 0;
          ctx.fillStyle = k > 0.05 ? colors.accent : colors.dot;
          ctx.globalAlpha = k > 0.05 ? 0.25 + k * 0.75 : 0.9;
          const r = 1 + k * 1.8;
          ctx.beginPath();
          ctx.arc(x + (x - px) * k * 0.08, y + (y - py) * k * 0.08, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      if (!reduce && (Math.abs(tx - px) > 0.5 || Math.abs(ty - py) > 0.5)) raf = requestAnimationFrame(draw);
      else raf = 0;
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      tx = e.clientX;
      ty = e.clientY;
      if (reduce) {
        px = tx;
        py = ty;
      }
      schedule();
    };
    const onLeave = () => {
      tx = ty = -9999;
      schedule();
    };

    readColors();
    resize();
    schedule();
    const mo = new MutationObserver(() => {
      readColors();
      schedule();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const onResize = () => {
      resize();
      schedule();
    };
    addEventListener('resize', onResize);
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      removeEventListener('resize', onResize);
      removeEventListener('scroll', schedule);
      removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 h-full w-full" />;
}
