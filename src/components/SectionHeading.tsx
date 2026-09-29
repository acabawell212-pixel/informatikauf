import type { ReactNode } from 'react';

export function SectionHeading({ eyebrow, title, description, centered = false }: { eyebrow: string; title: ReactNode; description?: string; centered?: boolean }) {
  return (
    <div className={`section-heading${centered ? ' centered' : ''}`}>
      <span className="eyebrow"><i />{eyebrow}</span>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}
