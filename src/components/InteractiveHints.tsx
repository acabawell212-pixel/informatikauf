import { useEffect } from 'react';

const HINT_ID = 'interactive-hint';

export function InteractiveHints() {
  useEffect(() => {
    const hint = document.createElement('div');
    hint.id = HINT_ID;
    hint.className = 'interactive-hint';
    hint.setAttribute('role', 'tooltip');
    hint.hidden = true;
    document.body.appendChild(hint);

    let activeTarget: HTMLElement | null = null;
    let previousDescription: string | null = null;
    let hideTimer = 0;

    const restoreDescription = () => {
      if (!activeTarget) return;
      if (previousDescription) activeTarget.setAttribute('aria-describedby', previousDescription);
      else activeTarget.removeAttribute('aria-describedby');
      activeTarget = null;
      previousDescription = null;
    };

    const hide = () => {
      hint.classList.remove('is-visible', 'hint-below');
      restoreDescription();
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => { hint.hidden = true; }, 160);
    };

    const positionHint = (target: HTMLElement) => {
      const bounds = target.getBoundingClientRect();
      const below = bounds.top < 64;
      const left = Math.min(window.innerWidth - 145, Math.max(145, bounds.left + bounds.width / 2));
      hint.style.left = `${left}px`;
      hint.style.top = `${below ? bounds.bottom + 8 : bounds.top - 8}px`;
      hint.classList.toggle('hint-below', below);
    };

    const show = (target: HTMLElement) => {
      const message = target.dataset.hint;
      if (!message) return;
      if (activeTarget === target) return;
      hide();
      window.clearTimeout(hideTimer);
      activeTarget = target;
      previousDescription = target.getAttribute('aria-describedby');
      target.setAttribute('aria-describedby', [previousDescription, HINT_ID].filter(Boolean).join(' '));
      hint.textContent = message;
      hint.hidden = false;
      positionHint(target);
      requestAnimationFrame(() => hint.classList.add('is-visible'));
    };

    const hideOnScroll = () => {
      if (activeTarget && document.activeElement === activeTarget) positionHint(activeTarget);
      else hide();
    };

    const targetFrom = (target: EventTarget | null) => target instanceof Element
      ? target.closest<HTMLElement>('[data-hint]')
      : null;

    const onPointerOver = (event: PointerEvent) => {
      const target = targetFrom(event.target);
      if (target && event.pointerType !== 'touch') show(target);
    };

    const onPointerOut = (event: PointerEvent) => {
      const target = targetFrom(event.target);
      if (!target || (event.relatedTarget instanceof Node && target.contains(event.relatedTarget))) return;
      if (target === activeTarget && document.activeElement !== target) hide();
    };

    const onFocusIn = (event: FocusEvent) => {
      const target = targetFrom(event.target);
      if (target) show(target);
    };

    const onFocusOut = (event: FocusEvent) => {
      const target = targetFrom(event.target);
      if (target === activeTarget && !(event.relatedTarget instanceof Node && target?.contains(event.relatedTarget))) hide();
    };

    document.addEventListener('pointerover', onPointerOver);
    document.addEventListener('pointerout', onPointerOut);
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    window.addEventListener('scroll', hideOnScroll, true);
    window.addEventListener('resize', hide);

    return () => {
      document.removeEventListener('pointerover', onPointerOver);
      document.removeEventListener('pointerout', onPointerOut);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
      window.removeEventListener('scroll', hideOnScroll, true);
      window.removeEventListener('resize', hide);
      window.clearTimeout(hideTimer);
      restoreDescription();
      hint.remove();
    };
  }, []);

  return null;
}
