/* Sistem Motion Presentasi — registry transisi sinematik.
   Setiap slide diberi varian transisi yang dipilih manual agar irama presentasi
   bervariasi: spektakuler hanya di cover, pergantian bab, dan penutup;
   slide isi memakai transisi cepat yang nyaman diikuti. */

export type PptTransitionKind =
  | 'portal'
  | 'shatter'
  | 'sweep'
  | 'push'
  | 'ring'
  | 'glitch';

export type PptTransitionSpec = {
  kind: PptTransitionKind;
  /** Durasi animasi masuk slide dalam milidetik (harus sama dengan durasi CSS). */
  duration: number;
  /** Overlay transisi ditampilkan bila durasi >= ambang ini. */
  overlay: boolean;
  label: string;
};

export type PptSlideEffect = {
  className: string;
  label: string;
};

const slideEffects: Record<number, PptSlideEffect> = {
  1: { className: 'effect-portal', label: 'Portal Bloom' },
  2: { className: 'effect-wave', label: 'Golden Wave' },
  3: { className: 'effect-shards', label: 'Prism Shards' },
  4: { className: 'effect-ripple', label: 'Emerald Ripple' },
  5: { className: 'effect-flare', label: 'Solar Flare' },
  6: { className: 'effect-constellation', label: 'Constellation Pulse' },
  7: { className: 'effect-curtain', label: 'Velvet Curtain' },
  8: { className: 'effect-vortex', label: 'Stellar Vortex' },
  9: { className: 'effect-bloom', label: 'Radial Bloom' },
  10: { className: 'effect-prism', label: 'Prismatic Sweep' },
  11: { className: 'effect-crosswave', label: 'Crosswave' },
  12: { className: 'effect-orbit', label: 'Orbit Rings' },
  13: { className: 'effect-eclipse', label: 'Eclipse Reveal' },
  14: { className: 'effect-finale', label: 'Grand Finale' },
};

export function getSlideEffect(slideId: number): PptSlideEffect {
  return slideEffects[slideId] ?? slideEffects[1];
}

export const transitionSpecs: Record<PptTransitionKind, PptTransitionSpec> = {
  portal: { kind: 'portal', duration: 960, overlay: false, label: 'Grand Impact' },
  shatter: { kind: 'shatter', duration: 960, overlay: false, label: 'Grand Impact' },
  sweep: { kind: 'sweep', duration: 960, overlay: false, label: 'Grand Impact' },
  push: { kind: 'push', duration: 960, overlay: false, label: 'Grand Impact' },
  ring: { kind: 'ring', duration: 960, overlay: false, label: 'Grand Impact' },
  glitch: { kind: 'glitch', duration: 960, overlay: false, label: 'Grand Impact' },
};

/** Varian yang ditampilkan saat sebuah slide menjadi tujuan. */
const targetTransitions: Record<number, PptTransitionKind> = {
  1: 'portal',
  2: 'sweep',
  3: 'glitch',
  4: 'ring',
  5: 'push',
  6: 'shatter',
  7: 'sweep',
  8: 'ring',
  9: 'glitch',
  10: 'push',
  11: 'shatter',
  12: 'sweep',
  13: 'portal',
  14: 'portal',
};

/** Varian yang dipakai ketika melangkah mundur (tetap konsisten per slide). */
const reverseTransitions: Record<number, PptTransitionKind> = {
  1: 'glitch',
  2: 'sweep',
  3: 'portal',
  4: 'ring',
  5: 'push',
  6: 'shatter',
  7: 'sweep',
  8: 'ring',
  9: 'glitch',
  10: 'push',
  11: 'shatter',
  12: 'sweep',
  13: 'glitch',
  14: 'portal',
};

export function pickTransition(
  targetId: number,
  direction: 'forward' | 'backward',
): PptTransitionKind {
  const map = direction === 'forward' ? targetTransitions : reverseTransitions;
  return map[targetId] ?? (direction === 'forward' ? 'sweep' : 'push');
}

/** Modulasi overlay agar setiap kali tampil tidak persis sama (subtle variation). */
export function overlayVariant(kind: PptTransitionKind, slideId: number): number {
  return (slideId * 3 + kind.length) % 3;
}
