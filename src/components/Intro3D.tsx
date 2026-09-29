import { useEffect, useRef } from 'react';

type V3 = [number, number, number];

const PHI = (1 + Math.sqrt(5)) / 2;
const ICO: V3[] = ([
  [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
  [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
  [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1],
] as V3[]).map(([x, y, z]) => {
  const l = Math.hypot(x, y, z);
  return [x / l, y / l, z / l] as V3;
});
const OCTA: V3[] = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];

const dist = (a: V3, b: V3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

function edgesOf(points: V3[]) {
  let min = Infinity;
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) min = Math.min(min, dist(points[i], points[j]));
  }
  const edges: [number, number][] = [];
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      if (dist(points[i], points[j]) < min * 1.02) edges.push([i, j]);
    }
  }
  return edges;
}
const ICO_EDGES = edgesOf(ICO);
const OCTA_EDGES = edgesOf(OCTA);

function rotate(point: V3, ax: number, ay: number, az: number): V3 {
  let [x, y, z] = point;
  let c = Math.cos(ax), s = Math.sin(ax);
  [y, z] = [y * c - z * s, y * s + z * c];
  c = Math.cos(ay); s = Math.sin(ay);
  [x, z] = [x * c + z * s, -x * s + z * c];
  c = Math.cos(az); s = Math.sin(az);
  [x, y] = [x * c - y * s, x * s + y * c];
  return [x, y, z];
}

type Star = { x: number; y: number; z: number; hue: number };

/** Adegan 3D ringan (canvas 2D + proyeksi perspektif) di belakang teks intro. */
export function Intro3D({ warp }: { warp: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const warpRef = useRef(warp);
  warpRef.current = warp;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let width = 0, height = 0, raf = 0;
    const small = window.matchMedia('(max-width: 560px)').matches;
    const stars: Star[] = Array.from({ length: small ? 110 : 220 }, () => ({
      x: (Math.random() - 0.5) * 2.4, y: (Math.random() - 0.5) * 2.4, z: Math.random(), hue: Math.random(),
    }));
    const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
    let warpT = 0;
    const start = performance.now();
    let last = start;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const onMove = (event: PointerEvent) => {
      pointer.x = event.clientX / window.innerWidth - 0.5;
      pointer.y = event.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener('pointermove', onMove);

    const gold = (a: number) => `rgba(236, 200, 114, ${a})`;
    const teal = (a: number) => `rgba(126, 218, 196, ${a})`;

    const drawShape = (
      points: V3[], edges: [number, number][], cx: number, cy: number, radius: number,
      ax: number, ay: number, az: number, color: (a: number) => string, alpha: number,
    ) => {
      const focal = 3.2;
      const projected = points.map((point) => {
        const [x, y, z] = rotate(point, ax, ay, az);
        const k = focal / (focal + z);
        return { x: cx + x * radius * k, y: cy + y * radius * k, z };
      });
      ctx.lineWidth = 1.1;
      for (const [a, b] of edges) {
        const p = projected[a], q = projected[b];
        const depth = (p.z + q.z) / 2;
        ctx.strokeStyle = color(alpha * (0.35 + 0.65 * (1 - (depth + 1) / 2)));
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
      }
      for (const p of projected) {
        const a = alpha * (0.5 + 0.5 * (1 - (p.z + 1) / 2));
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 9);
        glow.addColorStop(0, color(a));
        glow.addColorStop(1, color(0));
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 246, 220, .95)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 16.67, 3);
      last = now;
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, width, height);

      pointer.sx += (pointer.x - pointer.sx) * 0.06;
      pointer.sy += (pointer.y - pointer.sy) * 0.06;
      warpT += ((warpRef.current ? 1 : 0) - warpT) * 0.08 * dt;

      // pusat adegan mengikuti posisi medali di layar
      const medal = canvas.parentElement?.querySelector('.seal-medallion');
      const box = canvas.getBoundingClientRect();
      let cx = width / 2, cy = height * 0.38, base = Math.min(width, height) * 0.2;
      if (medal) {
        const r = medal.getBoundingClientRect();
        cx = r.left + r.width / 2 - box.left;
        cy = r.top + r.height / 2 - box.top;
        base = Math.max(r.width * (small ? 1.5 : 1.9), Math.min(width, height) * 0.16);
      }

      // terowongan bintang
      const speed = (0.0035 + warpT * 0.05) * dt;
      const fov = Math.max(width, height) * 0.62;
      for (const star of stars) {
        const prevZ = star.z;
        star.z -= speed;
        if (star.z <= 0.02) {
          star.x = (Math.random() - 0.5) * 2.4;
          star.y = (Math.random() - 0.5) * 2.4;
          star.z = 1;
          continue;
        }
        const k = 1 / star.z;
        const pk = 1 / prevZ;
        const sx = star.x + pointer.sx * 0.3;
        const sy = star.y + pointer.sy * 0.3;
        const px = width / 2 + sx * fov * 0.25 * k;
        const py = height / 2 + sy * fov * 0.25 * k;
        const ox = width / 2 + sx * fov * 0.25 * pk;
        const oy = height / 2 + sy * fov * 0.25 * pk;
        if (px < -20 || px > width + 20 || py < -20 || py > height + 20) { star.z = 1; continue; }
        const a = Math.min(1, (1 - star.z) * 1.4) * 0.85;
        ctx.strokeStyle = star.hue > 0.7 ? teal(a) : gold(a);
        ctx.lineWidth = Math.min(2.4, 0.5 + (1 - star.z) * 1.6);
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(px, py);
        ctx.stroke();
      }

      // intro membesar saat muncul, meledak saat keluar
      const appear = Math.min(1, t / 1.4);
      const ease = 1 - Math.pow(1 - appear, 3);
      const scale = ease * (1 + warpT * 2.6);
      const fade = 1 - warpT * 0.9;
      const spinY = t * 0.55 + pointer.sx * 2.2;
      const spinX = t * 0.32 + pointer.sy * 2.2 + 0.4;

      // cincin partikel miring
      for (let ring = 0; ring < 3; ring++) {
        const count = small ? 34 : 56;
        const tilt = 0.9 + ring * 0.75;
        for (let i = 0; i < count; i++) {
          const ang = (i / count) * Math.PI * 2 + t * (0.35 + ring * 0.12) * (ring % 2 ? -1 : 1);
          const rr = base * (1.55 + ring * 0.32) * scale;
          const [x, y, z] = rotate([Math.cos(ang), 0, Math.sin(ang)], tilt + pointer.sy, spinY * 0.4 + ring, 0);
          const k = 3.2 / (3.2 + z);
          const a = (0.25 + 0.55 * (1 - (z + 1) / 2)) * fade * ease;
          ctx.fillStyle = ring === 1 ? teal(a) : gold(a);
          ctx.beginPath();
          ctx.arc(cx + x * rr * k, cy + y * rr * k, 1.3 + (1 - (z + 1) / 2) * 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      drawShape(ICO, ICO_EDGES, cx, cy, base * 1.25 * scale, spinX, spinY, t * 0.15, gold, (small ? 0.65 : 0.8) * fade * ease);
      drawShape(OCTA, OCTA_EDGES, cx, cy, base * 0.72 * scale, -spinX * 1.4, -spinY * 1.6, 0, teal, (small ? 0.6 : 0.75) * fade * ease);

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return <canvas className="intro-3d" ref={canvasRef} aria-hidden="true" />;
}
