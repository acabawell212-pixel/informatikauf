import { useEffect } from 'react';

type Particle = {
  x: number; y: number; vx: number; vy: number;
  size: number; rot: number; spin: number;
  life: number; max: number; color: string; spikes: number;
};
type Ring = { x: number; y: number; life: number; max: number; color: string };

// warna tema situs: emas hangat, teal/hijau tua, mint, dan krem
const COLORS = ['#e2b04a', '#f3d27a', '#c8963a', '#3c8f86', '#7ccbbd', '#315e61', '#fff3d0'];
const RING_COLORS = ['#c8963a', '#3c8f86', '#e2b04a'];
const TAU = Math.PI * 2;

function starPath(ctx: CanvasRenderingContext2D, spikes: number, outer: number, inner: number) {
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i / (spikes * 2)) * TAU - Math.PI / 2;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

/** Percikan bintang di titik mana pun layar disentuh/diklik (termasuk saat intro). */
export function ClickSparkles() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // dipasang di <html> (di luar body) supaya tidak terkena CSS zoom monitor lebar
    const canvas = document.createElement('canvas');
    canvas.className = 'click-sparkles';
    canvas.setAttribute('aria-hidden', 'true');
    document.documentElement.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) { canvas.remove(); return; }

    let width = 0, height = 0, raf = 0, last = 0;
    const particles: Particle[] = [];
    const rings: Ring[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 16.67, 3) || 1;
      last = now;
      ctx.clearRect(0, 0, width, height);

      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i];
        r.life += dt;
        if (r.life >= r.max) { rings.splice(i, 1); continue; }
        const p = r.life / r.max;
        ctx.globalAlpha = (1 - p) * 0.7;
        ctx.strokeStyle = r.color;
        ctx.lineWidth = 2.2 * (1 - p) + 0.6;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 8 + p * 46, 0, TAU);
        ctx.stroke();
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += dt;
        if (p.life >= p.max) { particles.splice(i, 1); continue; }
        p.vx *= 0.985;
        p.vy = p.vy * 0.985 + 0.13 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.spin * dt;
        const t = p.life / p.max;
        const scale = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85 * 0.75;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.min(1, (1 - t) * 1.6);
        const s = p.size * scale;
        starPath(ctx, p.spikes, s, p.spikes === 4 ? s * 0.28 : s * 0.46);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(255, 255, 255, .85)';
        ctx.stroke();
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      raf = particles.length || rings.length ? requestAnimationFrame(loop) : 0;
      if (!raf) ctx.clearRect(0, 0, width, height);
    };

    const burst = (x: number, y: number) => {
      const count = 16;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * TAU + Math.random() * 0.5;
        const speed = 2.4 + Math.random() * 5.2;
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.6,
          size: 6 + Math.random() * 8,
          rot: Math.random() * TAU,
          spin: (Math.random() - 0.5) * 0.28,
          life: 0,
          max: 42 + Math.random() * 38,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          spikes: Math.random() > 0.45 ? 5 : 4,
        });
      }
      // beberapa bintang kecil yang melayang pelan ke atas
      for (let i = 0; i < 4; i++) {
        particles.push({
          x: x + (Math.random() - 0.5) * 24, y: y + (Math.random() - 0.5) * 24,
          vx: (Math.random() - 0.5) * 0.9, vy: -0.8 - Math.random() * 1.2,
          size: 3 + Math.random() * 3.5, rot: Math.random() * TAU, spin: (Math.random() - 0.5) * 0.1,
          life: 0, max: 60 + Math.random() * 30,
          color: '#fff6cf', spikes: 4,
        });
      }
      rings.push({ x, y, life: 0, max: 26, color: RING_COLORS[Math.floor(Math.random() * RING_COLORS.length)] });
      if (particles.length > 320) particles.splice(0, particles.length - 320);
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); }
    };

    const onDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      burst(event.clientX, event.clientY);
    };
    document.addEventListener('pointerdown', onDown, { capture: true });

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('pointerdown', onDown, { capture: true });
      window.removeEventListener('resize', resize);
      canvas.remove();
    };
  }, []);

  return null;
}
