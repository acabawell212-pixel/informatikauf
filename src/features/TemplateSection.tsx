import { useEffect, useState } from 'react';
import { ExternalLink, Presentation } from 'lucide-react';
import { SectionHeading } from '../components/SectionHeading';
import { pptTemplates } from '../data/site';
import { PptViewer } from './PptViewer';

export function TemplateSection() {
  const [openTitle, setOpenTitle] = useState<string | null>(null);
  const opened = pptTemplates.find((t) => t.title === openTitle);

  // Datang dari halaman admin (link "#templates"): gulir ke section ini setelah halaman utama tampil.
  useEffect(() => {
    if (window.location.hash !== '#templates') return;
    const timer = window.setTimeout(() => document.getElementById('templates')?.scrollIntoView({ behavior: 'smooth' }), 400);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section className="section template-section" id="templates"><div className="wrap">
      <SectionHeading eyebrow="TEMPLATE TUGAS" title={<>Ada tugas PPT?<br />Pakai <span>template ini.</span></>} description="Lihat template presentasi kelas langsung di web, lalu pakai susunannya untuk tugasmu." />
      <div className="template-grid">
        {pptTemplates.map((template) => (
          <article className="template-card" key={template.title}>
            <span className="template-icon"><Presentation size={22} /></span>
            <div className="template-copy">
              <h3>{template.title}</h3>
              <p>{template.description}</p>
            </div>
            <div className="template-actions">
              {template.file ? (
                <button className="button button-primary" type="button" onClick={() => setOpenTitle(template.title)} data-hint="Lihat semua slide template langsung di web.">
                  Buka PPT <Presentation size={15} />
                </button>
              ) : (
                <a className="button button-primary" href={template.link} target="_blank" rel="noreferrer" data-hint="Buka template di tab baru.">
                  Buka PPT <ExternalLink size={15} />
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
    {opened && <PptViewer title={opened.title} onClose={() => setOpenTitle(null)} />}
    </section>
  );
}
