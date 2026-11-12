import { useEffect, useState } from 'react';

/** Rute berbasis hash (`#/admin`) — satu tempat logika routing sederhana aplikasi ini. */
export function useHashRoute(prefix: string): boolean {
  const matches = () => window.location.hash.startsWith(prefix);
  const [active, setActive] = useState(matches);
  useEffect(() => {
    const onHash = () => setActive(matches());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefix]);
  return active;
}

/** Kunci scroll body selama overlay terbuka (intro, lightbox), lalu kembalikan seperti semula. */
export function useBodyScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [locked]);
}

/** Jalankan handler saat tombol Escape ditekan, hanya ketika `active` bernilai true. */
export function useEscapeKey(handler: () => void, active = true): void {
  useEffect(() => {
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handler();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handler, active]);
}
