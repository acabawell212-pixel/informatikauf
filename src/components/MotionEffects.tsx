import { useEffect, useRef } from 'react';

const animatedSelector = [
  '.section-heading', '.principle-card', '.value-row', '.stats-strip', '.activity-card',
  '.project-card', '.project-bottom-note', '.member-card', '.members-note', '.event-row',
  '.past-event-note', '.article-card', '.contact-form', '.contact-details', '.footer-top',
  '.schedule-overview', '.course-row', '.schedule-disclaimer', '.gallery-toolbar',
  '.gallery-card', '.gallery-disclaimer',
].join(',');

export function MotionEffects() {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    document.documentElement.classList.add('motion-ready');
    const items = [...document.querySelectorAll<HTMLElement>(animatedSelector)];
    items.forEach((item, index) => {
      item.classList.add('motion-item');
      item.style.setProperty('--reveal-delay', `${(index % 4) * 75}ms`);
    });

    let scrollDirection: 'up' | 'down' = 'down';
    let previousScrollY = window.scrollY;
    document.documentElement.dataset.scrollDirection = scrollDirection;

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const target = entry.target as HTMLElement;
        if (entry.isIntersecting) {
          target.dataset.revealDirection = scrollDirection;
          target.classList.add('is-visible');
        } else target.classList.remove('is-visible');
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });
    items.forEach((item) => revealObserver.observe(item));

    const sections = [...document.querySelectorAll<HTMLElement>('main section[id]')];
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        document.querySelectorAll<HTMLAnchorElement>('.nav-links a[href^="#"], .nav-cta').forEach((link) => {
          link.classList.toggle('is-active', link.hash === `#${entry.target.id}`);
        });
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    sections.forEach((section) => sectionObserver.observe(section));

    const updateProgress = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > previousScrollY + 1) scrollDirection = 'down';
      else if (currentScrollY < previousScrollY - 1) scrollDirection = 'up';
      document.documentElement.dataset.scrollDirection = scrollDirection;
      previousScrollY = currentScrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    };
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);

    const art = document.querySelector<HTMLElement>('.hero-art');
    const onPointerMove = (event: PointerEvent) => {
      if (!art || event.pointerType === 'touch') return;
      const bounds = art.getBoundingClientRect();
      art.style.setProperty('--pointer-x', `${(event.clientX - bounds.left - bounds.width / 2) * 0.07}px`);
      art.style.setProperty('--pointer-y', `${(event.clientY - bounds.top - bounds.height / 2) * 0.07}px`);
    };
    const resetPointer = () => {
      art?.style.setProperty('--pointer-x', '0px');
      art?.style.setProperty('--pointer-y', '0px');
    };
    art?.addEventListener('pointermove', onPointerMove);
    art?.addEventListener('pointerleave', resetPointer);

    return () => {
      revealObserver.disconnect();
      sectionObserver.disconnect();
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
      art?.removeEventListener('pointermove', onPointerMove);
      art?.removeEventListener('pointerleave', resetPointer);
      document.documentElement.classList.remove('motion-ready');
      delete document.documentElement.dataset.scrollDirection;
    };
  }, []);

  return <div className="scroll-progress" ref={progressRef} aria-hidden="true" />;
}
