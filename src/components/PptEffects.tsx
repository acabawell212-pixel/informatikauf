import { useEffect, useState, type CSSProperties } from 'react';
import type { PptTransitionKind } from './pptTransitions';

/* Lapisan efek visual presentasi. Semuanya dekoratif (aria-hidden), murni CSS
   transform/opacity agar tetap ringan di proyektor dan tidak mengganggu teks. */

const fallingStars = Array.from({ length: 26 }, (_, index) => ({
  x: (index * 37 + 11) % 100,
  delay: (index % 7) * 70,
  duration: 1000 + (index % 5) * 100,
  size: 3 + (index % 3),
  drift: ((index % 5) - 2) * 20,
}));

/** Reveal slide dengan bintang jatuh yang tetap berada di bawah kontrol. */
export function PptTransitionFx({
  kind,
  variant,
}: {
  kind: PptTransitionKind;
  variant: number;
}) {
  return (
    <div className={`ppt-fx ppt-fx-${kind} ppt-fx-v${variant}`} aria-hidden="true">
      <span className="ppt-starfield">
        {fallingStars.map((star, index) => (
          <i
            key={index}
            style={{
              '--star-x': `${star.x}%`,
              '--star-delay': `${star.delay}ms`,
              '--star-duration': `${star.duration}ms`,
              '--star-size': `${star.size}px`,
              '--star-drift': `${star.drift}px`,
            } as CSSProperties}
          />
        ))}
      </span>
    </div>
  );
}

const burstFragments = Array.from({ length: 16 }, (_, index) => ({
  x: 14 + ((index * 47) % 73),
  y: 12 + ((index * 31) % 77),
  delay: (index % 5) * 24,
}));

export function PptTransitionBurst({
  direction,
  effectClass,
}: {
  direction: 'forward' | 'backward';
  effectClass: string;
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setVisible(false), 1100);
    return () => window.clearTimeout(timeout);
  }, []);

  if (!visible) return null;

  return (
    <div className={`ppt-transition-burst burst-${direction} ${effectClass}`} aria-hidden="true">
      <span className="ppt-burst-core" />
      <span className="ppt-burst-ring burst-ring-one" />
      <span className="ppt-burst-ring burst-ring-two" />
      <span className="ppt-burst-beam" />
      <span className="ppt-burst-cross" />
      <span className="ppt-burst-halo" />
      {burstFragments.map((fragment, index) => (
        <i
          className="ppt-burst-fragment"
          key={index}
          style={{
            '--burst-x': `${fragment.x}%`,
            '--burst-y': `${fragment.y}%`,
            '--burst-delay': `${fragment.delay}ms`,
            '--burst-angle': `${index * 47}deg`,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}

/** Ambient sinematik yang terus hidup selama presentasi: grid, horizon glow, partikel. */
export function PptAmbientFx() {
  return (
    <div className="ppt-ambient" aria-hidden="true">
      <span className="ppt-ambient-grid" />
      <span className="ppt-ambient-horizon" />
      <span className="ppt-ambient-sweep" />
      <span className="ppt-ambient-hud hud-tl" />
      <span className="ppt-ambient-hud hud-tr" />
      <span className="ppt-ambient-hud hud-bl" />
      <span className="ppt-ambient-hud hud-br" />
      <span className="ppt-particles">
        {Array.from({ length: 26 }, (_, index) => (
          <i key={index} className={`ppt-particle p${index % 13}`} />
        ))}
      </span>
      <span className="ppt-film-grain" />
      <span className="ppt-vignette" />
    </div>
  );
}
