import { useEffect, useRef } from 'react';
import { ICO, ICO_EDGES, OCTA, OCTA_EDGES, FOCAL, drawWire, rotate } from './scene3d';

type Node = { x: number; y: number; vx: number; vy: number; r: number };
const TAU = Math.PI * 2;

/** Adegan 3D di belakang jendela kode hero: bola wireframe, cincin partikel, dan jaring konstelasi yang bereaksi ke kursor. */
export function HeroScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const small = window.matchMedia('(max-width: 820px)').matches;
    let width = 0, height = 0, raf = 0;
    let visible = true;
    const pointer = { x: 0, y: 0, sx: 0, sy: 0, px: -999, py: -999 };
    const nodes: Node[] = Array.from({ length: small ? 16 : 30 }, () => ({
      x: Math.random(), y: Math.random(), vx: (Math.random() - 0.5) * 0.00028, vy: (Math.random() - 0.5) * 0.00028, r: 1.2 + Math.random() * 1.8,
    }));
    const start = performance.now();
    let lastDraw = 0;
    let slowFrames = 0;
    let stopped = false;

    const gold = (a: number) => `rgba(176, 128, 44, ${a})`;
    const teal = (a: number) => `rgba(34, 116, 112, ${a})`;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const onMove = (event: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      pointer.px = event.clientX - box.left;
      pointer.py = event.clientY - box.top;
      pointer.x = Math.max(-1, Math.min(1, (pointer.px / box.width - 0.5) * 2));
      pointer.y = Math.max(-1, Math.min(1, (pointer.py / box.height - 0.5) * 2));
    };
    window.addEventListener('pointermove', onMove);

    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    observer.observe(canvas);

    const frame = (now: number) => {
      if (stopped) return;
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) return;
      // dekorasi cukup 30 fps; lewati frame di antaranya
      if (now - lastDraw < 32) return;
      const cost = performance.now();
      lastDraw = now;
      const t = Math.max(0, (now - start) / 1000);
      ctx.clearRect(0, 0, width, height);
      pointer.sx += (pointer.x - pointer.sx) * 0.05;
      pointer.sy += (pointer.y - pointer.sy) * 0.05;

      const cx = width * 0.5, cy = height * 0.5;
      const base = Math.min(width, height) * 0.46;

      // jaring konstelasi
      const pts = nodes.map((n) => {
        n.x += n.vx * 16; n.y += n.vy * 16;
        if (n.x < 0 || n.x > 1) n.vx *= -1;
        if (n.y < 0 || n.y > 1) n.vy *= -1;
        return { x: n.x * width, y: n.y * height, r: n.r };
      });
      ctx.lineWidth = 1;
      const reach = Math.max(90, Math.min(150, width * 0.22));
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
          if (d < reach) {
            ctx.strokeStyle = teal((1 - d / reach) * 0.28);
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
        const dp = Math.hypot(pts[i].x - pointer.px, pts[i].y - pointer.py);
        if (dp < 170) {
          ctx.strokeStyle = gold((1 - dp / 170) * 0.6);
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pointer.px, pointer.py);
          ctx.stroke();
        }
        ctx.fillStyle = gold(0.7);
        ctx.beginPath();
        ctx.arc(pts[i].x, pts[i].y, pts[i].r, 0, TAU);
        ctx.fill();
      }

      // cincin partikel 3D
      for (let ring = 0; ring < 2; ring++) {
        const count = small ? 30 : 52;
        for (let i = 0; i < count; i++) {
          const ang = (i / count) * TAU + t * (0.3 + ring * 0.14) * (ring ? -1 : 1);
          const rr = base * (1.12 + ring * 0.24);
          const [x, y, z] = rotate([Math.cos(ang), 0, Math.sin(ang)], 1 + ring * 0.9 + pointer.sy * 0.5, t * 0.2 + pointer.sx * 1.2 + ring * 2, 0);
          const k = FOCAL / (FOCAL + z);
          const a = 0.2 + 0.6 * (1 - (z + 1) / 2);
          ctx.fillStyle = ring ? teal(a) : gold(a);
          ctx.beginPath();
          ctx.arc(cx + x * rr * k, cy + y * rr * k, 1.2 + (1 - (z + 1) / 2) * 1.4, 0, TAU);
          ctx.fill();
        }
      }

      const dot = 'rgba(96, 66, 20, .9)';
      drawWire(ctx, ICO, ICO_EDGES, cx, cy, base, t * 0.3 + pointer.sy * 1.2 + 0.4, t * 0.45 + pointer.sx * 1.6, t * 0.1, gold, 0.75, dot);
      drawWire(ctx, OCTA, OCTA_EDGES, cx, cy, base * 0.58, -t * 0.4 - pointer.sy, -t * 0.6 - pointer.sx * 1.4, 0, teal, 0.75, 'rgba(20, 70, 68, .9)');

      // perangkat lambat: bila menggambar terus memakan >12 ms, matikan adegan hiasan ini
      slowFrames = performance.now() - cost > 12 ? slowFrames + 1 : Math.max(0, slowFrames - 1);
      if (slowFrames > 45) {
        stopped = true;
        cancelAnimationFrame(raf);
        canvas.style.display = 'none';
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return <canvas className="hero-scene" ref={canvasRef} aria-hidden="true" />;
}
