export type V3 = [number, number, number];

const PHI = (1 + Math.sqrt(5)) / 2;

export const ICO: V3[] = ([
  [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
  [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
  [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1],
] as V3[]).map(([x, y, z]) => {
  const l = Math.hypot(x, y, z);
  return [x / l, y / l, z / l] as V3;
});
export const OCTA: V3[] = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];

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
export const ICO_EDGES = edgesOf(ICO);
export const OCTA_EDGES = edgesOf(OCTA);

export function rotate(point: V3, ax: number, ay: number, az: number): V3 {
  let [x, y, z] = point;
  let c = Math.cos(ax), s = Math.sin(ax);
  [y, z] = [y * c - z * s, y * s + z * c];
  c = Math.cos(ay); s = Math.sin(ay);
  [x, z] = [x * c + z * s, -x * s + z * c];
  c = Math.cos(az); s = Math.sin(az);
  [x, y] = [x * c - y * s, x * s + y * c];
  return [x, y, z];
}

export const FOCAL = 3.2;

/** Proyeksi perspektif; z lebih besar = lebih jauh. */
export function project(point: V3, cx: number, cy: number, radius: number) {
  const k = FOCAL / (FOCAL + point[2]);
  return { x: cx + point[0] * radius * k, y: cy + point[1] * radius * k, z: point[2], k };
}

export type ColorFn = (alpha: number) => string;

export function drawWire(
  ctx: CanvasRenderingContext2D, points: V3[], edges: [number, number][],
  cx: number, cy: number, radius: number, ax: number, ay: number, az: number,
  color: ColorFn, alpha: number, dotColor = 'rgba(255, 246, 220, .95)', lineWidth = 1.1,
) {
  const projected = points.map((point) => project(rotate(point, ax, ay, az), cx, cy, radius));
  ctx.lineWidth = lineWidth;
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
    ctx.fillStyle = dotColor;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
}

export type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number };
export type Meteor = { x: number; y: number; vx: number; vy: number; len: number; w: number; sparks: Spark[] };

export function makeMeteor(width: number, height: number, fast = false): Meteor {
  const angle = Math.PI * (0.74 + Math.random() * 0.08); // jatuh ke kiri-bawah
  const speed = (fast ? 20 : 9) + Math.random() * (fast ? 14 : 8);
  return {
    x: width * (0.25 + Math.random() * 0.9),
    y: -30 - Math.random() * height * 0.25,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    len: 130 + Math.random() * 190,
    w: 1.4 + Math.random() * 1.8,
    sparks: [],
  };
}

/** Gerakkan + gambar meteor beserta ekor dan percikannya. Mengembalikan false bila sudah keluar layar. */
export function stepMeteor(
  ctx: CanvasRenderingContext2D, m: Meteor, dt: number, width: number, height: number,
  tail: [number, number, number], glow: [number, number, number], headColor: string, gain = 1,
) {
  m.x += m.vx * dt;
  m.y += m.vy * dt;
  const speed = Math.hypot(m.vx, m.vy);
  const ux = m.vx / speed, uy = m.vy / speed;
  const tx = m.x - ux * m.len, ty = m.y - uy * m.len;

  const grad = ctx.createLinearGradient(tx, ty, m.x, m.y);
  grad.addColorStop(0, `rgba(${tail[0]}, ${tail[1]}, ${tail[2]}, 0)`);
  grad.addColorStop(0.7, `rgba(${tail[0]}, ${tail[1]}, ${tail[2]}, ${0.55 * gain})`);
  grad.addColorStop(1, headColor);
  ctx.lineCap = 'round';
  ctx.strokeStyle = grad;
  ctx.lineWidth = m.w;
  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.lineTo(m.x, m.y);
  ctx.stroke();

  const halo = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 14 + m.w * 4);
  halo.addColorStop(0, `rgba(${glow[0]}, ${glow[1]}, ${glow[2]}, ${0.85 * gain})`);
  halo.addColorStop(1, `rgba(${glow[0]}, ${glow[1]}, ${glow[2]}, 0)`);
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(m.x, m.y, 14 + m.w * 4, 0, Math.PI * 2);
  ctx.fill();

  // percikan yang tertinggal di jalur meteor
  if (Math.random() < 0.9 * dt) {
    m.sparks.push({
      x: m.x - ux * Math.random() * m.len * 0.5, y: m.y - uy * Math.random() * m.len * 0.5,
      vx: (Math.random() - 0.5) * 0.6, vy: Math.random() * 0.5, life: 0, max: 26 + Math.random() * 26,
    });
  }
  for (let i = m.sparks.length - 1; i >= 0; i--) {
    const s = m.sparks[i];
    s.life += dt;
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    if (s.life >= s.max) { m.sparks.splice(i, 1); continue; }
    const a = (1 - s.life / s.max) * 0.85 * gain;
    ctx.fillStyle = `rgba(${glow[0]}, ${glow[1]}, ${glow[2]}, ${a})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 0.9 + (1 - s.life / s.max) * 1.3, 0, Math.PI * 2);
    ctx.fill();
  }
  return m.x > -m.len - 60 && m.y < height + m.len + 60 && m.x < width + m.len + 200;
}

/** Bintang berkilau empat sudut. */
export function drawFlare(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, alpha: number, rgb: [number, number, number]) {
  const c = `${rgb[0]}, ${rgb[1]}, ${rgb[2]}`;
  const glow = ctx.createRadialGradient(x, y, 0, x, y, size);
  glow.addColorStop(0, `rgba(${c}, ${alpha})`);
  glow.addColorStop(1, `rgba(${c}, 0)`);
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 1;
  for (const [dx, dy] of [[1, 0], [0, 1]] as const) {
    const line = ctx.createLinearGradient(x - dx * size * 2.6, y - dy * size * 2.6, x + dx * size * 2.6, y + dy * size * 2.6);
    line.addColorStop(0, `rgba(${c}, 0)`);
    line.addColorStop(0.5, `rgba(${c}, ${alpha})`);
    line.addColorStop(1, `rgba(${c}, 0)`);
    ctx.strokeStyle = line;
    ctx.beginPath();
    ctx.moveTo(x - dx * size * 2.6, y - dy * size * 2.6);
    ctx.lineTo(x + dx * size * 2.6, y + dy * size * 2.6);
    ctx.stroke();
  }
}
