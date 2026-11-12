import { useEffect, useState } from 'react';

/** Kueri media yang dipakai berkali-kali di project ini. */
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
export const FINE_POINTER_QUERY = '(hover: hover) and (pointer: fine)';

/**
 * Satu sumber kebenaran untuk "apakah pengguna meminta animasi dikurangi?".
 * Dipakai efek dekoratif (canvas, tilt, suara) sebelum mengaktifkan dirinya.
 */
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/** Apakah perangkat memakai kursor presisi (mouse/trackpad), bukan layar sentuh. */
export function hasFinePointer(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(FINE_POINTER_QUERY).matches;
}

/** Versi reaktif dari prefersReducedMotion() untuk dipakai di dalam komponen. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(prefersReducedMotion);
  useEffect(() => {
    const query = window.matchMedia(REDUCED_MOTION_QUERY);
    const onChange = () => setReduced(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return reduced;
}
