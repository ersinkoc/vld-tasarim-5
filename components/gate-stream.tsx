'use client';

import { useEffect, useRef } from 'react';
import { getSupportedLocales, setLocale } from '@oxog/vld';
import { SAMPLES, display, type Sample } from '@/lib/samples';
import { RTL } from '@/lib/locales';

type State = 'idle' | 'pass' | 'fail';

type Packet = {
  el: HTMLDivElement;
  lane: number;
  x: number;
  y: number;
  w: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  alpha: number;
  sample: Sample;
  value: unknown;
  state: State;
};

type Note = { el: HTMLDivElement; y: number; life: number };

const LANE_SPEED = [86, 112, 72, 98];
const NOTE_LIFE = 2.8;

const pick = <T,>(list: readonly T[]): T => list[Math.floor(Math.random() * list.length)];

export function GateStream() {
  const rootRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const gateRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const checkedRef = useRef<HTMLSpanElement>(null);
  const rejectedRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const layer = layerRef.current;
    const gate = gateRef.current;
    if (!root || !layer || !gate) return;

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const locales = getSupportedLocales().filter((l) => l !== 'en');
    const packets: Packet[] = [];
    const notes: Note[] = [];
    const lastInLane: (Packet | undefined)[] = [];
    let checked = 0;
    let rejected = 0;
    let width = root.clientWidth;
    let height = root.clientHeight;
    let lanes = width < 640 ? 3 : 4;
    let spawnTimer = 0;
    let flashTimer = 0;

    const gateX = () => width * (width < 640 ? 0.42 : 0.62);
    const laneY = (lane: number) => 28 + lane * ((height - 56) / lanes);

    const resize = () => {
      width = root.clientWidth;
      height = root.clientHeight;
      lanes = width < 640 ? 3 : 4;
      gate.style.left = `${gateX()}px`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(root);

    const spawn = () => {
      const free = Array.from({ length: lanes }, (_, i) => i).filter((i) => {
        const last = lastInLane[i];
        return !last || last.x > 40;
      });
      if (free.length === 0) return;
      const lane = pick(free);
      const sample = pick(SAMPLES);
      const value = Math.random() < 0.58 ? pick(sample.good) : pick(sample.bad);

      const el = document.createElement('div');
      el.className =
        'group absolute left-0 top-0 flex items-center gap-2 whitespace-nowrap rounded-full border border-line bg-surface/90 py-1.5 pl-3 pr-2.5 font-mono text-[11.5px] text-ink shadow-[0_1px_0_var(--line)] backdrop-blur-sm transition-colors duration-300 will-change-transform data-[state=fail]:border-fail data-[state=fail]:text-fail data-[state=pass]:border-pass';
      el.dataset.state = 'idle';
      const key = document.createElement('span');
      key.className = 'text-muted';
      key.textContent = `${sample.field}:`;
      const val = document.createElement('span');
      val.textContent = display(value);
      const mark = document.createElement('span');
      mark.className =
        'grid size-4 place-items-center rounded-full bg-sunken text-[10px] leading-none text-muted transition-colors duration-300 group-data-[state=fail]:bg-fail group-data-[state=fail]:text-surface group-data-[state=pass]:bg-pass group-data-[state=pass]:text-surface';
      mark.textContent = '·';
      el.append(key, val, mark);
      layer.append(el);

      const w = el.offsetWidth;
      const p: Packet = {
        el,
        lane,
        x: -w - 8,
        y: laneY(lane) - el.offsetHeight / 2,
        w,
        vx: LANE_SPEED[lane % LANE_SPEED.length],
        vy: 0,
        rot: 0,
        vr: 0,
        alpha: 1,
        sample,
        value,
        state: 'idle',
      };
      packets.push(p);
      lastInLane[lane] = p;
    };

    const note = (p: Packet, message: string, locale: string) => {
      const el = document.createElement('div');
      el.className =
        'pointer-events-none absolute left-0 top-0 flex items-baseline gap-2 text-[13px] font-medium leading-snug text-fail';
      el.style.maxWidth = `${Math.min(340, width - gateX() - 28)}px`;
      const tag = document.createElement('span');
      tag.className = 'shrink-0 rounded-sm bg-fail px-1 font-mono text-[9.5px] font-semibold text-surface';
      tag.textContent = locale;
      const text = document.createElement('span');
      text.textContent = message;
      if (RTL.has(locale)) text.dir = 'rtl';
      el.append(tag, text);
      layer.append(el);
      const y = p.y - 4;
      el.style.transform = `translate(${gateX() + 18}px, ${y}px)`;
      notes.push({ el, y, life: NOTE_LIFE });
    };

    const flash = (state: State) => {
      gate.dataset.flash = state;
      window.clearTimeout(flashTimer);
      flashTimer = window.setTimeout(() => (gate.dataset.flash = 'idle'), 260);
    };

    const cross = (p: Packet) => {
      const locale = pick(locales);
      setLocale(locale);
      const result = p.sample.make().safeParse(p.value);
      setLocale('en');
      checked++;
      if (labelRef.current) labelRef.current.textContent = p.sample.source;
      const mark = p.el.lastElementChild as HTMLSpanElement;
      if (result.success) {
        p.state = 'pass';
        mark.textContent = '✓';
      } else {
        p.state = 'fail';
        rejected++;
        p.vx *= 0.3;
        p.vy = -60;
        p.vr = (Math.random() - 0.5) * 70;
        mark.textContent = '×';
        if (notes.length < 7) note(p, result.error?.message ?? 'Invalid', locale);
      }
      p.el.dataset.state = p.state;
      flash(p.state);
      if (checkedRef.current) checkedRef.current.textContent = checked.toLocaleString('en');
      if (rejectedRef.current) rejectedRef.current.textContent = rejected.toLocaleString('en');
    };

    const step = (dt: number) => {
      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        spawn();
        spawnTimer = 0.62 + Math.random() * 0.55;
      }
      const gx = gateX();
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        p.x += p.vx * dt;
        if (p.state === 'idle' && p.x + p.w / 2 >= gx) cross(p);
        if (p.state === 'fail') {
          p.vy += 820 * dt;
          p.y += p.vy * dt;
          p.rot += p.vr * dt;
          p.alpha -= dt * 0.9;
        }
        if (p.state === 'pass' && p.x > width - p.w - 24) p.alpha -= dt * 2.4;
        if (p.alpha <= 0 || p.x > width || p.y > height + 40) {
          p.el.remove();
          packets.splice(i, 1);
          continue;
        }
        p.el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.rot}deg)`;
        p.el.style.opacity = String(Math.max(0, p.alpha));
      }
      for (let i = notes.length - 1; i >= 0; i--) {
        const n = notes[i];
        n.life -= dt;
        n.y -= 14 * dt;
        if (n.life <= 0) {
          n.el.remove();
          notes.splice(i, 1);
          continue;
        }
        const t = n.life / NOTE_LIFE;
        n.el.style.transform = `translate(${gx + 18}px, ${n.y}px)`;
        n.el.style.opacity = String(Math.min(1, t * 2.2, (1 - t) * 8));
      }
    };

    if (reduce) {
      // Fast-forward a few seconds of the simulation and freeze it.
      for (let i = 0; i < 60 * 16; i++) step(1 / 60);
      return () => ro.disconnect();
    }

    let raf = 0;
    let last = 0;
    let visible = true;
    const frame = (t: number) => {
      const dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
      last = t;
      step(dt);
      raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !visible) {
        visible = true;
        last = 0;
        raf = requestAnimationFrame(frame);
      } else if (!entry.isIntersecting && visible) {
        visible = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(root);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.clearTimeout(flashTimer);
      layer.replaceChildren();
    };
  }, []);

  return (
    <div className="relative">
      <div
        ref={rootRef}
        className="mask-x relative h-[230px] overflow-hidden sm:h-[260px]"
        aria-hidden="true"
      >
        <div
          ref={gateRef}
          data-flash="idle"
          className="group absolute inset-y-0 w-px bg-accent shadow-[0_0_18px_2px_var(--accent)] transition-[background-color,box-shadow] duration-200 data-[flash=fail]:bg-fail data-[flash=fail]:shadow-[0_0_26px_4px_var(--fail)] data-[flash=pass]:bg-pass data-[flash=pass]:shadow-[0_0_26px_4px_var(--pass)]"
        >
          <span className="absolute -left-[3px] top-0 size-[7px] rounded-full bg-inherit" />
          <span className="absolute -left-[3px] bottom-0 size-[7px] rounded-full bg-inherit" />
        </div>
        <div ref={layerRef} className="absolute inset-0" />
      </div>
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-baseline justify-between gap-x-8 gap-y-2 px-5 pt-4 text-[13px] text-muted sm:px-8">
        <p>
          Every value above is checked live by <span className="text-ink">@oxog/vld</span> in this tab. Rejections
          speak one of its 32 locales.
        </p>
        <p className="flex items-baseline gap-5 font-mono text-[12px] tabular-nums">
          <span>
            gate <span ref={labelRef} className="text-accent">z.string().email()</span>
          </span>
          <span>
            checked <span ref={checkedRef} className="text-ink">0</span>
          </span>
          <span>
            rejected <span ref={rejectedRef} className="text-fail">0</span>
          </span>
        </p>
      </div>
    </div>
  );
}
