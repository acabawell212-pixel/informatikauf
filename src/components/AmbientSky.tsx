import { useEffect, useRef } from 'react';
import { makeMeteor, stepMeteor, type Meteor } from './scene3d';

type Mote = { x: number; y: number; depth: number; size: number; phase: number; drift: number; teal: boolean };

/** Lapisan partikel emas + bintang jatuh yang melintas di atas seluruh halaman (tidak menghalangi klik). */
export function AmbientSky() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const small = window.matchMedia('(max-width: 820px)').matches;
    let width = 0, height = 0, raf = 0;
    const motes: Mote[] = Array.from({ length: small ? 26 : 56 }, () => ({
      x: Math.random(), y: Math.random(), depth: 0.2 + Math.random() * 0.8, size: 1.2 + Math.random() * 3.2,
      phase: Math.random() * Math.PI * 2, drift: 0.4 + Math.random() * 0.9, teal: Math.random() > 0.72,
    }));
    const meteors: Meteor[] = [];
    let nextMeteor = 2.5;
    let scrollY = window.scrollY, smoothScroll = scrollY;
    const pointer = { x: 0.5, y: 0.5, sx: 0.5, sy: 0.5 };
    let last = performance.now();
    let visible = true;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const onScroll = () => { scrollY = window.scrollY; };
    const onMove = (event: PointerEvent) => { pointer.x = event.clientX / width; pointer.y = event.clientY / height; };
    const onVisibility = () => { visible = !document.hidden; last = performance.now(); };
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onMove);
    document.addEventListener('visibilitychange', onVisibility);

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const dt = Math.min((now - last) / 16.67, 3);
      last = now;
      const t = now / 1000;
      ctx.clearRect(0, 0, width, height);

      smoothScroll += (scrollY - smoothScroll) * 0.08;
      pointer.sx += (pointer.x - pointer.sx) * 0.05;
      pointer.sy += (pointer.y - pointer.sy) * 0.05;
      const velocity = scrollY - smoothScroll;

      for (const m of motes) {
        m.y -= 0.00006 * m.drift * dt;
        if (m.y < -0.05) m.y = 1.05;
        // paralaks: partikel dekat bergerak lebih jauh saat scroll
        const py = (((m.y * height - smoothScroll * m.depth * 0.22) % (height + 40)) + height + 40) % (height + 40) - 20;
        const px = m.x * width + Math.sin(t * 0.5 * m.drift + m.phase) * 22 * m.depth + (pointer.sx - 0.5) * -40 * m.depth;
        const tw = 0.5 + 0.5 * Math.sin(t * 1.4 * m.drift + m.phase);
        const r = m.size * (0.7 + m.depth * 0.6);
        const a = (0.28 + tw * 0.5) * (0.4 + m.depth * 0.6);
        const rgb = m.teal ? '60, 168, 158' : '226, 168, 62';
        const g = ctx.createRadialGradient(px, py, 0, px, py, r * 4);
        g.addColorStop(0, `rgba(${rgb}, ${a})`);
        g.addColorStop(0.35, `rgba(${rgb}, ${a * 0.35})`);
        g.addColorStop(1, `rgba(${rgb}, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(px, py, r * 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255, 246, 214, ${Math.min(1, a + 0.2)})`;
        ctx.beginPath();
        ctx.arc(px, py, r * 0.55, 0, Math.PI * 2);
        ctx.fill();
        // ekor tipis saat scroll cepat
        if (Math.abs(velocity) > 6) {
          ctx.strokeStyle = `rgba(${rgb}, ${Math.min(0.5, Math.abs(velocity) / 90) * m.depth})`;
          ctx.lineWidth = r * 0.7;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px, py + velocity * m.depth * 1.6);
          ctx.stroke();
        }
      }

      nextMeteor -= dt / 60;
      if (nextMeteor <= 0 && meteors.length < 3) {
        const m = makeMeteor(width, height * 0.7);
        m.y = -20 - Math.random() * 60;
        m.len *= 0.9;
        meteors.push(m);
        nextMeteor = 3.5 + Math.random() * 5;
      }
      for (let i = meteors.length - 1; i >= 0; i--) {
        const alive = stepMeteor(ctx, meteors[i], dt, width, height, [224, 160, 52], [236, 176, 64], 'rgba(255, 244, 214, 1)', 0.9);
        if (!alive) meteors.splice(i, 1);
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas className="ambient-sky" ref={canvasRef} aria-hidden="true" />;
}
