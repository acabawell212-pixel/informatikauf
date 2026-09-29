import { useEffect, useRef } from 'react';
import { pageZoom, zoomOf } from './zoom';

const tiltSelector = '.member-card, .activity-card, .project-card, .article-card, .gallery-card, .principle-card, .contact-form';
const magnetSelector = '.button, .nav-cta';
const rippleSelector = '.button, .nav-cta, .gallery-filter, .schedule-day-tab, .filter-pill';

/** Efek interaktif: tilt 3D + kilau, tombol magnetik, riak klik, cahaya kursor, parallax. */
export function Effects3D() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const cleanups: Array<() => void> = [];

    // Parallax hero mengikuti scroll (semua perangkat)
    const hero = document.querySelector<HTMLElement>('.hero-art');
    let scrollFrame = 0;
    const onScroll = () => {
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        if (hero && window.scrollY < 1400) hero.style.setProperty('--py', String(window.scrollY));
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    cleanups.push(() => window.removeEventListener('scroll', onScroll));

    // Jeda animasi CSS yang tak terlihat (hemat CPU/GPU)
    const pausable = document.querySelectorAll<HTMLElement>('main > section, .marquee, .site-footer');
    const pauseObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        (entry.target as HTMLElement).dataset.offscreen = entry.isIntersecting ? 'false' : 'true';
      });
    }, { rootMargin: '120px 0px' });
    pausable.forEach((el) => pauseObserver.observe(el));
    cleanups.push(() => { pauseObserver.disconnect(); pausable.forEach((el) => delete el.dataset.offscreen); });

    // Riak saat tombol ditekan (semua perangkat)
    const onDown = (event: PointerEvent) => {
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(rippleSelector);
      if (!target) return;
      const box = target.getBoundingClientRect();
      const z = zoomOf(target);
      const size = Math.max(target.offsetWidth, target.offsetHeight) * 2;
      const ripple = document.createElement('span');
      ripple.className = 'fx-ripple';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${(event.clientX - box.left) / z - size / 2}px`;
      ripple.style.top = `${(event.clientY - box.top) / z - size / 2}px`;
      target.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    };
    document.addEventListener('pointerdown', onDown);
    cleanups.push(() => document.removeEventListener('pointerdown', onDown));

    // Versi sentuh: kartu miring mengikuti jari saat ditekan (pengganti hover)
    let pressed: HTMLElement | null = null;
    const pressRelease = () => {
      if (!pressed) return;
      const el = pressed;
      el.classList.remove('is-tilting');
      el.classList.add('tilt-release');
      window.setTimeout(() => el.classList.remove('tilt-release'), 560);
      pressed = null;
    };
    const pressMove = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') return;
      const card = (event.target as HTMLElement | null)?.closest<HTMLElement>(tiltSelector) ?? null;
      if (!card) return;
      if (pressed && pressed !== card) pressRelease();
      const box = card.getBoundingClientRect();
      const px = (event.clientX - box.left) / box.width;
      const py = (event.clientY - box.top) / box.height;
      card.style.setProperty('--rx', `${((0.5 - py) * 6).toFixed(2)}deg`);
      card.style.setProperty('--ry', `${((px - 0.5) * 6).toFixed(2)}deg`);
      card.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
      card.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
      if (!card.querySelector(':scope > .tilt-glare')) {
        if (getComputedStyle(card).position === 'static') card.style.position = 'relative';
        const shine = document.createElement('span');
        shine.className = 'tilt-glare';
        shine.setAttribute('aria-hidden', 'true');
        card.appendChild(shine);
      }
      card.classList.remove('tilt-release');
      card.classList.add('is-tilting');
      pressed = card;
    };
    document.addEventListener('pointerdown', pressMove);
    document.addEventListener('pointermove', pressMove);
    document.addEventListener('pointerup', pressRelease);
    document.addEventListener('pointercancel', pressRelease);
    cleanups.push(() => {
      document.removeEventListener('pointerdown', pressMove);
      document.removeEventListener('pointermove', pressMove);
      document.removeEventListener('pointerup', pressRelease);
      document.removeEventListener('pointercancel', pressRelease);
    });

    if (!finePointer) return () => cleanups.forEach((fn) => fn());

    // Cahaya yang mengikuti kursor
    const glow = glowRef.current;
    let zoom = pageZoom();
    const onResizeZoom = () => { zoom = pageZoom(); };
    window.addEventListener('resize', onResizeZoom);
    cleanups.push(() => window.removeEventListener('resize', onResizeZoom));
    const cursor = { x: window.innerWidth / 2, y: window.innerHeight / 2, gx: 0, gy: 0, seen: false };
    let glowFrame = 0;
    const glowLoop = () => {
      cursor.gx += (cursor.x - cursor.gx) * 0.14;
      cursor.gy += (cursor.y - cursor.gy) * 0.14;
      if (glow) glow.style.transform = `translate3d(${cursor.gx / zoom - 260}px, ${cursor.gy / zoom - 260}px, 0)`;
      // berhenti saat sudah menempel ke kursor; dijalankan lagi ketika kursor bergerak
      glowFrame = Math.hypot(cursor.x - cursor.gx, cursor.y - cursor.gy) > 0.5 ? requestAnimationFrame(glowLoop) : 0;
    };
    const wakeGlow = () => { if (!glowFrame) glowFrame = requestAnimationFrame(glowLoop); };
    cleanups.push(() => cancelAnimationFrame(glowFrame));

    // Tilt 3D kartu + tombol magnetik
    let tilted: HTMLElement | null = null;
    let releaseTimer = 0;
    const magnets = new Map<HTMLElement, { x: number; y: number; tx: number; ty: number }>();
    let magnetFrame = 0;

    const magnetLoop = () => {
      let moving = false;
      magnets.forEach((m, el) => {
        m.x += (m.tx - m.x) * 0.18;
        m.y += (m.ty - m.y) * 0.18;
        if (Math.abs(m.x - m.tx) < 0.05 && Math.abs(m.y - m.ty) < 0.05 && m.tx === 0 && m.ty === 0) {
          el.style.translate = '';
          magnets.delete(el);
        } else {
          el.style.translate = `${m.x}px ${m.y}px`;
          moving = true;
        }
      });
      magnetFrame = moving ? requestAnimationFrame(magnetLoop) : 0;
    };
    const setMagnet = (el: HTMLElement, tx: number, ty: number) => {
      const m = magnets.get(el) ?? { x: 0, y: 0, tx: 0, ty: 0 };
      m.tx = tx; m.ty = ty;
      magnets.set(el, m);
      if (!magnetFrame) magnetFrame = requestAnimationFrame(magnetLoop);
    };

    const release = (el: HTMLElement) => {
      el.classList.remove('is-tilting');
      el.classList.add('tilt-release');
      window.clearTimeout(releaseTimer);
      releaseTimer = window.setTimeout(() => el.classList.remove('tilt-release'), 560);
    };

    let hoveredMagnet: HTMLElement | null = null;
    let moveFrame = 0;
    let lastEvent: PointerEvent | null = null;

    const handleMove = () => {
      moveFrame = 0;
      const event = lastEvent;
      if (!event) return;
      cursor.x = event.clientX;
      cursor.y = event.clientY;
      wakeGlow();
      if (!cursor.seen && glow) { cursor.seen = true; cursor.gx = cursor.x; cursor.gy = cursor.y; glow.classList.add('is-on'); }

      const target = event.target as HTMLElement | null;
      const card = target?.closest<HTMLElement>(tiltSelector) ?? null;
      if (tilted && tilted !== card) { release(tilted); tilted = null; }
      if (card) {
        const box = card.getBoundingClientRect();
        const px = (event.clientX - box.left) / box.width;
        const py = (event.clientY - box.top) / box.height;
        const max = Math.min(9, 4 + 3200 / Math.max(box.width, 220));
        card.style.setProperty('--rx', `${((0.5 - py) * max).toFixed(2)}deg`);
        card.style.setProperty('--ry', `${((px - 0.5) * max).toFixed(2)}deg`);
        card.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
        card.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
        if (!card.querySelector(':scope > .tilt-glare')) {
          if (getComputedStyle(card).position === 'static') card.style.position = 'relative';
          const shine = document.createElement('span');
          shine.className = 'tilt-glare';
          shine.setAttribute('aria-hidden', 'true');
          card.appendChild(shine);
        }
        card.classList.remove('tilt-release');
        card.classList.add('is-tilting');
        tilted = card;
      }

      const magnet = target?.closest<HTMLElement>(magnetSelector) ?? null;
      if (hoveredMagnet && hoveredMagnet !== magnet) { setMagnet(hoveredMagnet, 0, 0); hoveredMagnet = null; }
      if (magnet) {
        const box = magnet.getBoundingClientRect();
        const mz = zoomOf(magnet);
        setMagnet(magnet, ((event.clientX - (box.left + box.width / 2)) * 0.22) / mz, ((event.clientY - (box.top + box.height / 2)) * 0.3) / mz);
        hoveredMagnet = magnet;
      }
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      lastEvent = event;
      if (!moveFrame) moveFrame = requestAnimationFrame(handleMove);
    };
    const onLeave = () => {
      if (tilted) { release(tilted); tilted = null; }
      if (hoveredMagnet) { setMagnet(hoveredMagnet, 0, 0); hoveredMagnet = null; }
      glow?.classList.remove('is-on');
      cursor.seen = false;
    };
    document.addEventListener('pointermove', onMove);
    document.documentElement.addEventListener('mouseleave', onLeave);
    cleanups.push(() => {
      document.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(moveFrame);
      cancelAnimationFrame(magnetFrame);
      window.clearTimeout(releaseTimer);
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return <div className="cursor-glow" ref={glowRef} aria-hidden="true" />;
}
