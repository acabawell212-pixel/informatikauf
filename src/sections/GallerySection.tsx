import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight, Camera, Play, X } from 'lucide-react';
import { galleryPhotos, type GalleryItem } from '../data/siteData';
import { SectionHeading } from '../components/SectionHeading';

type GalleryPhoto = GalleryItem;
const categories = ['Semua', ...new Set(galleryPhotos.map((photo) => photo.category))];

export function GallerySection() {
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [pageSize] = useState(() => window.matchMedia('(max-width: 560px)').matches ? 4 : 6);
  const [limit, setLimit] = useState(pageSize);
  const filteredPhotos = activeCategory === 'Semua'
    ? galleryPhotos
    : galleryPhotos.filter((photo) => photo.category === activeCategory);
  const visiblePhotos = filteredPhotos.slice(0, limit);
  const hiddenCount = filteredPhotos.length - visiblePhotos.length;

  useEffect(() => {
    if (!selectedPhoto) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedPhoto(null);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [selectedPhoto]);

  useEffect(() => {
    const previews = [...document.querySelectorAll<HTMLVideoElement>('.gallery-preview-video')];
    if (!previews.length) return;
    if (selectedPhoto) {
      previews.forEach((video) => video.pause());
      return;
    }
    // hanya putar video yang sedang terlihat di layar (hemat decoder & baterai)
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) {
          video.muted = true;
          void video.play().catch(() => {});
        } else video.pause();
      });
    }, { threshold: 0.25 });
    previews.forEach((video) => observer.observe(video));
    return () => {
      observer.disconnect();
      previews.forEach((video) => video.pause());
    };
  }, [visiblePhotos, selectedPhoto]);

  return (
    <section className="section gallery-section" id="gallery">
      <div className="wrap">
        <div className="section-row gallery-heading-row">
          <SectionHeading
            eyebrow="CERITA DALAM GAMBAR"
            title={<>Momen kecil,<br /><span>kenangan besar.</span></>}
            description="Potongan cerita dari proses belajar, bikin karya, dan tumbuh bersama."
          />
          <div className="gallery-note"><Camera size={16} /><span>ALBUM KELUARGA<br /><b>Informatika Faletehan</b></span></div>
        </div>

        <div className="gallery-toolbar">
          <div className="gallery-filters" aria-label="Filter foto berdasarkan kategori">
            {categories.map((category) => (
              <button
                className={`gallery-filter${activeCategory === category ? ' active' : ''}`}
                type="button"
                key={category}
                aria-pressed={activeCategory === category}
                data-hint={`Tampilkan foto kategori ${category}.`}
                onClick={() => { setActiveCategory(category); setLimit(pageSize); }}
              >
                {category}
              </button>
            ))}
          </div>
          <span className="gallery-count">{String(filteredPhotos.length).padStart(2, '0')} MOMEN</span>
        </div>

        <div className="gallery-grid">
          {visiblePhotos.map((photo, index) => (
            <article
              className={`gallery-card gallery-card--${photo.layout}`}
              key={photo.id}
              tabIndex={0}
              role="button"
              onClick={() => setSelectedPhoto(photo)}
              onKeyDown={(event) => {
                if (event.target !== event.currentTarget) return;
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setSelectedPhoto(photo);
                }
              }}
              data-hint={photo.video ? 'Klik frame video untuk memperbesar dan membuka suara.' : 'Klik untuk melihat foto dengan ukuran lebih besar.'}
              aria-label={`Lihat foto: ${photo.title}`}
            >
              {photo.video ? (
                <video
                  className="gallery-preview-video"
                  src={photo.video}
                  poster={photo.poster}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label={photo.title}
                  onError={(event) => { event.currentTarget.style.display = 'none'; }}
                />
              ) : photo.image ? (
                <img
                  src={photo.image}
                  alt={photo.caption}
                  loading="lazy"
                  decoding="async"
                  onError={(event) => { event.currentTarget.style.display = 'none'; }}
                />
              ) : null}
              <span className="gallery-image-shade" />
              <span className="gallery-card-index">MOMENT / 0{index + 1}</span>
              {photo.video && <span className="gallery-video-badge"><Play size={10} fill="currentColor" /> VIDEO<span className="badge-extra"> · KLIK UNTUK BUKA SUARA</span></span>}
              <span className="gallery-card-open"><ArrowUpRight size={17} /></span>
              <span className="gallery-card-caption"><small>{photo.category}</small><strong>{photo.title}</strong><span>{photo.caption}</span></span>
            </article>
          ))}
        </div>
        {filteredPhotos.length > pageSize && (
          <div className="gallery-more">
            {hiddenCount > 0 ? (
              <button className="gallery-more-btn" type="button" data-hint="Munculkan foto dan video lainnya." onClick={() => setLimit((current) => current + pageSize)}>
                Tampilkan lebih banyak <b>+{Math.min(hiddenCount, pageSize)}</b>
              </button>
            ) : (
              <button
                className="gallery-more-btn"
                type="button"
                onClick={() => {
                  setLimit(pageSize);
                  document.querySelector('.gallery-toolbar')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
              >
                Tampilkan lebih sedikit
              </button>
            )}
            <span className="gallery-more-count">Menampilkan {visiblePhotos.length} dari {filteredPhotos.length}</span>
          </div>
        )}
        <p className="gallery-disclaimer">Coding Session masih memakai gambar contoh. Meme juga bisa diganti dengan karya lucu komunitas sendiri.</p>
      </div>

      {selectedPhoto && createPortal(
        <div className="gallery-lightbox" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedPhoto(null); }}>
          <button className="lightbox-close" type="button" onClick={() => setSelectedPhoto(null)} aria-label="Tutup foto" data-hint="Tutup tampilan foto besar."><X size={22} /><span>Tutup</span></button>
          <div className="lightbox-panel" role="dialog" aria-modal="true" aria-label={`Foto ${selectedPhoto.title}`}>
            {selectedPhoto.video ? (
              <video
                src={selectedPhoto.video}
                poster={selectedPhoto.poster}
                controls
                autoPlay
                loop
                playsInline
                preload="auto"
                onCanPlay={(event) => {
                  const video = event.currentTarget;
                  void video.play().catch(() => {});
                }}
                onClick={(event) => {
                  const video = event.currentTarget;
                  if (video.muted) {
                    video.muted = false;
                    if (video.paused) void video.play();
                  }
                }}
              />
            ) : selectedPhoto.image ? (
              <img src={selectedPhoto.image} alt={selectedPhoto.caption} />
            ) : null}
            <div className="lightbox-caption"><span>{selectedPhoto.category}</span><h3>{selectedPhoto.title}</h3><p>{selectedPhoto.caption}</p></div>
          </div>
        </div>,
        document.body,
      )}
    </section>
  );
}
