import { useEffect, useRef } from 'react';
import {
  ICO, ICO_EDGES, OCTA, OCTA_EDGES, FOCAL, drawFlare, drawWire, makeMeteor, project, rotate, stepMeteor,
  type Meteor,
} from './scene3d';

type Star = { x: number; y: number; z: number; hue: number };

const GLYPHS = ['{', '}', '<', '/>', '0', '1', '=>', '( )', '[ ]', '#', ';', '&&', '++', '::', 'fn', '</>'];
const TAU = Math.PI * 2;

/** Adegan 3D di belakang teks intro: bintang jatuh, terowongan bintang, nebula, cincin kode, planet. */
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
    const stars: Star[] = Array.from({ length: small ? 150 : 320 }, () => ({
      x: (Math.random() - 0.5) * 2.4, y: (Math.random() - 0.5) * 2.4, z: Math.random(), hue: Math.random(),
    }));
    const flares = Array.from({ length: small ? 8 : 16 }, () => ({
      x: Math.random(), y: Math.random() * 0.85, size: 3 + Math.random() * 4, phase: Math.random() * TAU, teal: Math.random() > 0.65,
    }));
    const orbs = [
      { tilt: 0.6, spin: 0.9, r: 2.05, size: 0.16, a: [255, 226, 160], b: [176, 118, 40], phase: 0 },
      { tilt: 1.5, spin: -0.7, r: 2.45, size: 0.12, a: [190, 246, 232], b: [30, 120, 118], phase: 2.1 },
      { tilt: 2.3, spin: 0.55, r: 2.8, size: 0.09, a: [232, 214, 255], b: [96, 74, 176], phase: 4.2 },
    ];
    const meteors: Meteor[] = [];
    const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
    let warpT = 0;
    let nextMeteor = 0.6;
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

    const nebula = (x: number, y: number, r: number, rgb: string, a: number) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(${rgb}, ${a})`);
      g.addColorStop(1, `rgba(${rgb}, 0)`);
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    };

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 16.67, 3);
      last = now;
      const t = Math.max(0, (now - start) / 1000);
      ctx.clearRect(0, 0, width, height);

      pointer.sx += (pointer.x - pointer.sx) * 0.06;
      pointer.sy += (pointer.y - pointer.sy) * 0.06;
      warpT += ((warpRef.current ? 1 : 0) - warpT) * 0.08 * dt;

      const medal = canvas.parentElement?.querySelector('.seal-medallion');
      const box = canvas.getBoundingClientRect();
      let cx = width / 2, cy = height * 0.38, base = Math.min(width, height) * 0.2;
      if (medal) {
        const r = medal.getBoundingClientRect();
        cx = r.left + r.width / 2 - box.left;
        cy = r.top + r.height / 2 - box.top;
        base = Math.max(r.width * (small ? 1.5 : 1.9), Math.min(width, height) * 0.16);
      }

      const appear = Math.min(1, t / 1.6);
      const ease = 1 - Math.pow(1 - appear, 3);
      const scale = ease * (1 + warpT * 2.6);
      const fade = 1 - warpT * 0.9;
      const spinY = t * 0.55 + pointer.sx * 2.2;
      const spinX = t * 0.32 + pointer.sy * 2.2 + 0.4;

      // ---- nebula berlapis (paralaks) ----
      const nx = pointer.sx * 60, ny = pointer.sy * 40;
      nebula(width * 0.22 + nx + Math.sin(t * 0.13) * 40, height * 0.3 + ny, Math.max(width, height) * 0.5, '60, 168, 158', 0.16);
      nebula(width * 0.78 - nx + Math.cos(t * 0.11) * 50, height * 0.62 - ny, Math.max(width, height) * 0.46, '214, 164, 84', 0.13);
      nebula(width * 0.55 + nx * 0.5, height * 0.15, Math.max(width, height) * 0.38, '120, 96, 196', 0.1);

      // ---- bintang berkilau (twinkle) ----
      for (const f of flares) {
        const tw = 0.45 + 0.55 * Math.sin(t * 1.6 + f.phase);
        drawFlare(ctx, f.x * width + pointer.sx * -22, f.y * height + pointer.sy * -16, f.size * (0.7 + tw * 0.5), tw * 0.85 * ease,
          f.teal ? [150, 236, 214] : [255, 228, 160]);
      }

      // ---- terowongan bintang (kedalaman: ukuran & ekor) ----
      const speed = (0.0035 + warpT * 0.05) * dt;
      const fov = Math.max(width, height) * 0.62;
      ctx.lineCap = 'round';
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
        const near = 1 - star.z;
        const a = Math.min(1, near * 1.4) * 0.9;
        ctx.strokeStyle = star.hue > 0.7 ? teal(a) : gold(a);
        ctx.lineWidth = Math.min(3, 0.5 + near * 2.1);
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(px, py);
        ctx.stroke();
        if (near > 0.72 && !warpRef.current) {
          ctx.fillStyle = `rgba(255, 246, 220, ${a})`;
          ctx.beginPath();
          ctx.arc(px, py, 0.8 + near * 1.2, 0, TAU);
          ctx.fill();
        }
      }

      // ---- bintang jatuh + ekor ----
      nextMeteor -= (dt / 60) * (warpT > 0.2 ? 6 : 1);
      if (nextMeteor <= 0 && meteors.length < (small ? 5 : 9)) {
        meteors.push(makeMeteor(width, height, warpT > 0.2));
        nextMeteor = (warpT > 0.2 ? 0.06 : 0.45) + Math.random() * (warpT > 0.2 ? 0.1 : 1.1);
      }
      for (let i = meteors.length - 1; i >= 0; i--) {
        const alive = stepMeteor(ctx, meteors[i], dt, width, height, [255, 226, 150], [255, 236, 190], 'rgba(255, 252, 238, 1)', ease);
        if (!alive) meteors.splice(i, 1);
      }

      // ---- billboard 3D: planet + cincin huruf kode ----
      type Item = { z: number; draw: () => void };
      const items: Item[] = [];
      const ringRadius = base * 1.9 * scale;
      GLYPHS.forEach((glyph, i) => {
        const ang = (i / GLYPHS.length) * TAU + t * 0.28;
        const p = project(rotate([Math.cos(ang), 0, Math.sin(ang)], 1.05 + pointer.sy * 0.8, spinY * 0.35, 0.25), cx, cy, ringRadius);
        const near = 1 - (p.z + 1) / 2;
        items.push({
          z: p.z,
          draw: () => {
            ctx.font = `${Math.round((small ? 9 : 11) + near * (small ? 6 : 9))}px "DM Mono", monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = i % 3 === 0 ? teal((0.35 + near * 0.6) * fade * ease) : gold((0.35 + near * 0.6) * fade * ease);
            ctx.shadowColor = 'rgba(236, 200, 114, .6)';
            ctx.shadowBlur = 8 * near;
            ctx.fillText(glyph, p.x, p.y);
            ctx.shadowBlur = 0;
          },
        });
      });
      for (const orb of orbs) {
        const ang = t * orb.spin * 0.6 + orb.phase;
        const p = project(rotate([Math.cos(ang), 0, Math.sin(ang)], orb.tilt, spinY * 0.3 + orb.tilt, 0), cx, cy, base * orb.r * scale);
        const rad = Math.max(3, base * orb.size * p.k * scale);
        items.push({
          z: p.z,
          draw: () => {
            const g = ctx.createRadialGradient(p.x - rad * 0.35, p.y - rad * 0.4, rad * 0.1, p.x, p.y, rad);
            g.addColorStop(0, `rgba(${orb.a[0]}, ${orb.a[1]}, ${orb.a[2]}, ${0.98 * ease * fade})`);
            g.addColorStop(1, `rgba(${orb.b[0]}, ${orb.b[1]}, ${orb.b[2]}, ${0.95 * ease * fade})`);
            ctx.shadowColor = `rgba(${orb.a[0]}, ${orb.a[1]}, ${orb.a[2]}, .7)`;
            ctx.shadowBlur = rad * 1.6;
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(p.x, p.y, rad, 0, TAU);
            ctx.fill();
            ctx.shadowBlur = 0;
          },
        });
      }
      items.filter((item) => item.z > 0).forEach((item) => item.draw());

      // ---- gelombang kejut ----
      for (let i = 0; i < 3; i++) {
        const phase = ((t * 0.55 + i / 3) % 1);
        const rad = Math.max(1, base * (0.9 + phase * 3.4) * scale);
        ctx.strokeStyle = gold((1 - phase) * 0.32 * ease * fade);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rad, rad * (0.32 + pointer.sy * 0.2), -0.25 + pointer.sx * 0.5, 0, TAU);
        ctx.stroke();
      }

      // ---- cincin partikel miring ----
      for (let ring = 0; ring < 3; ring++) {
        const count = small ? 34 : 60;
        const tilt = 0.9 + ring * 0.75;
        for (let i = 0; i < count; i++) {
          const ang = (i / count) * TAU + t * (0.35 + ring * 0.12) * (ring % 2 ? -1 : 1);
          const rr = base * (1.55 + ring * 0.32) * scale;
          const [x, y, z] = rotate([Math.cos(ang), 0, Math.sin(ang)], tilt + pointer.sy, spinY * 0.4 + ring, 0);
          const k = FOCAL / (FOCAL + z);
          const a = (0.25 + 0.55 * (1 - (z + 1) / 2)) * fade * ease;
          ctx.fillStyle = ring === 1 ? teal(a) : gold(a);
          ctx.beginPath();
          ctx.arc(cx + x * rr * k, cy + y * rr * k, 1.3 + (1 - (z + 1) / 2) * 1.3, 0, TAU);
          ctx.fill();
        }
      }

      // ---- bentuk wireframe ----
      drawWire(ctx, ICO, ICO_EDGES, cx, cy, base * 1.25 * scale, spinX, spinY, t * 0.15, gold, (small ? 0.65 : 0.8) * fade * ease);
      drawWire(ctx, OCTA, OCTA_EDGES, cx, cy, base * 0.72 * scale, -spinX * 1.4, -spinY * 1.6, 0, teal, (small ? 0.6 : 0.75) * fade * ease);

      items.filter((item) => item.z <= 0).forEach((item) => item.draw());

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
