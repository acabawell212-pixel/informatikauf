import { useEffect, useRef, useState } from 'react';
import { Braces, Sparkles } from 'lucide-react';

const introKey = 'faletehan-opening-intro-seen';

type IntroPhase = 'hidden' | 'showing' | 'leaving';

function shouldPlayIntro() {
  try {
    return !window.sessionStorage.getItem(introKey)
      && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

export function OpeningIntro() {
  const [phase, setPhase] = useState<IntroPhase>(() => shouldPlayIntro() ? 'showing' : 'hidden');
  const hideTimer = useRef<number | undefined>(undefined);
  const dialogRef = useRef<HTMLDivElement>(null);

  const dismiss = () => {
    setPhase((current) => current === 'showing' ? 'leaving' : current);
    try {
      window.sessionStorage.setItem(introKey, 'true');
    } catch {
      // The intro still exits normally when browser storage is unavailable.
    }
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setPhase('hidden'), 720);
  };

  useEffect(() => {
    if (phase === 'showing') dialogRef.current?.focus();
  }, [phase]);

  useEffect(() => {
    if (phase === 'hidden') return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [phase]);

  useEffect(() => () => window.clearTimeout(hideTimer.current), []);

  if (phase === 'hidden') return null;

  return (
    <div
      className={`opening-intro${phase === 'leaving' ? ' is-leaving' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Intro Group Informatika Universitas Faletehan"
      aria-live="polite"
      tabIndex={-1}
      ref={dialogRef}
      onClick={dismiss}
      onPointerMove={(event) => {
        if (event.pointerType === 'touch') return;
        const bounds = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        event.currentTarget.style.setProperty('--intro-tilt-x', `${y * -5}deg`);
        event.currentTarget.style.setProperty('--intro-tilt-y', `${x * 7}deg`);
        event.currentTarget.style.setProperty('--intro-drift-x', `${x * -14}px`);
        event.currentTarget.style.setProperty('--intro-drift-y', `${y * -10}px`);
      }}
      onPointerLeave={(event) => {
        event.currentTarget.style.setProperty('--intro-tilt-x', '0deg');
        event.currentTarget.style.setProperty('--intro-tilt-y', '0deg');
        event.currentTarget.style.setProperty('--intro-drift-x', '0px');
        event.currentTarget.style.setProperty('--intro-drift-y', '0px');
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          dismiss();
        }
      }}
    >
      <div className="intro-atlas" aria-hidden="true" />
      <div className="intro-landscape" aria-hidden="true"><i /><i /><i /><span /></div>
      <div className="intro-star intro-star-one" aria-hidden="true">✧</div>
      <div className="intro-star intro-star-two" aria-hidden="true">✦</div>
      <div className="intro-star intro-star-three" aria-hidden="true">✧</div>
      <div className="intro-frame" aria-hidden="true"><i /><i /><i /><i /></div>

      <div className="intro-content">
        <div className="intro-seal" aria-hidden="true">
          <span className="seal-halo" />
          <span className="seal-orbit seal-orbit-one" />
          <span className="seal-orbit seal-orbit-two" />
          <span className="seal-medallion"><span className="seal-core"><Braces size={34} strokeWidth={1.5} /></span></span>
          <span className="seal-spark seal-spark-one"><Sparkles size={15} /></span>
          <span className="seal-spark seal-spark-two">✦</span>
        </div>
        <p className="intro-kicker">UNIVERSITAS FALETEHAN <span>·</span> SERANG</p>
        <h1>INFORMATIKA</h1>
        <p className="intro-subtitle">GROUP INFORMATIKA UNIVERSITAS FALETEHAN</p>
        <div className="intro-divider"><i /><Sparkles size={15} /><i /></div>
        <p className="intro-motto">Belajar. Berkarya. Bertumbuh bersama.</p>
        <p className="intro-continue" aria-hidden="true"><span /> KLIK DI MANA SAJA UNTUK MELANJUTKAN <span /></p>
      </div>
    </div>
  );
}
