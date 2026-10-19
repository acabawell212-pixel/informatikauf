import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  X,
  Play,
  Pause,
  Sparkles,
  Presentation,
  Code2,
  Terminal,
  CheckCircle2,
  Lightbulb
} from 'lucide-react';
import { pptSlides, type SlideContent } from '../data/pptSlides';
import { getSlideEffect, pickTransition, transitionSpecs, overlayVariant, type PptTransitionKind } from './pptTransitions';
import { PptTransitionFx, PptTransitionBurst, PptAmbientFx } from './PptEffects';
import { PptNetworkScene } from './PptNetworkScene';
import { PptDigitalCar } from './PptDigitalCar';

const EXIT_TRANSITION_MS = 240;
const SLIDE_ARRIVAL_MS = 1500;

function renderMotionText(text: string) {
  return Array.from(text, (character, index) => character === ' '
    ? ' '
    : (
      <span
        className="ppt-motion-char"
        key={`${index}-${character}`}
        style={{ ['--char-index' as string]: index } as CSSProperties}
      >
        {character}
      </span>
    ));
}

interface PptModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSlide?: number;
}

export function PptModal({ isOpen, onClose, initialSlide = 0 }: PptModalProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(initialSlide);
  const [transition, setTransition] = useState<PptTransitionKind>('push');
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward'>('forward');
  const [transitionKey, setTransitionKey] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [slideScale, setSlideScale] = useState(1);
  const modalRef = useRef<HTMLDivElement>(null);
  const slideViewportRef = useRef<HTMLElement>(null);
  const slideContentRef = useRef<HTMLDivElement>(null);
  const transitionLockRef = useRef(false);
  const transitionStartTimerRef = useRef<number | undefined>(undefined);
  const transitionUnlockTimerRef = useRef<number | undefined>(undefined);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const totalSlides = pptSlides.length;
  const contentSlideCount = totalSlides - 1;

  const currentSlide: SlideContent = pptSlides[currentSlideIndex] ?? pptSlides[0];
  const spec = transitionSpecs[transition];
  const slideEffect = currentSlide.isCover
    ? { className: 'effect-portal', label: 'Group 6 Intro' }
    : getSlideEffect(currentSlide.id);
  const variant = overlayVariant(transition, currentSlide.id);

  /* Setiap perpindahan menyuntik varian transisi baru + key baru sehingga animasi
     dimainkan ulang dari awal (overlay, entrance konten, dan isi slide). */
  const playTransition = useCallback((kind: PptTransitionKind, direction: 'forward' | 'backward') => {
    setTransition(kind);
    setTransitionDirection(direction);
    setTransitionKey((key) => key + 1);
  }, []);

  const startNavigation = useCallback((targetIndex: number, direction: 'forward' | 'backward') => {
    if (transitionLockRef.current || targetIndex < 0 || targetIndex >= totalSlides) return;
    transitionLockRef.current = true;
    setTransitionDirection(direction);
    setIsExiting(true);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const exitDelay = reducedMotion ? 0 : EXIT_TRANSITION_MS + 40;
    transitionStartTimerRef.current = window.setTimeout(() => {
      setCurrentSlideIndex(targetIndex);
      playTransition(pickTransition(pptSlides[targetIndex].id, direction), direction);
      setIsExiting(false);
      transitionUnlockTimerRef.current = window.setTimeout(() => {
        transitionLockRef.current = false;
      }, reducedMotion ? 0 : SLIDE_ARRIVAL_MS);
    }, exitDelay);
  }, [playTransition, totalSlides]);

  const goToNext = useCallback(() => {
    const next = (currentSlideIndex + 1) % totalSlides;
    startNavigation(next, 'forward');
  }, [currentSlideIndex, startNavigation, totalSlides]);

  const goToPrev = useCallback(() => {
    const previous = (currentSlideIndex - 1 + totalSlides) % totalSlides;
    startNavigation(previous, 'backward');
  }, [currentSlideIndex, startNavigation, totalSlides]);

  const goToSlide = useCallback((index: number) => {
    if (index < 0 || index >= totalSlides || index === currentSlideIndex || transitionLockRef.current) return;
    const direction = index > currentSlideIndex ? 'forward' : 'backward';
    startNavigation(index, direction);
  }, [currentSlideIndex, startNavigation, totalSlides]);

  const handleTouchStart = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType !== 'touch' || (event.target instanceof Element && event.target.closest('button, a, input, textarea, select'))) return;
    touchStartRef.current = { x: event.clientX, y: event.clientY };
  };
  const handleTouchEnd = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType !== 'touch' || !touchStartRef.current) return;
    const deltaX = event.clientX - touchStartRef.current.x;
    const deltaY = event.clientY - touchStartRef.current.y;
    touchStartRef.current = null;
    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) return;
    if (deltaX < 0) goToNext();
    else goToPrev();
  };

  useEffect(() => {
    if (isOpen) return;
    window.clearTimeout(transitionStartTimerRef.current);
    window.clearTimeout(transitionUnlockTimerRef.current);
    transitionLockRef.current = false;
    setIsExiting(false);
  }, [isOpen]);

  useEffect(() => () => {
    window.clearTimeout(transitionStartTimerRef.current);
    window.clearTimeout(transitionUnlockTimerRef.current);
    transitionLockRef.current = false;
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) return;

    const viewport = slideViewportRef.current;
    const content = slideContentRef.current;
    if (!viewport || !content) return;

    let frame = 0;
    const fitSlide = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const viewportStyle = window.getComputedStyle(viewport);
        const availableWidth = viewport.clientWidth
          - parseFloat(viewportStyle.paddingLeft)
          - parseFloat(viewportStyle.paddingRight);
        const availableHeight = viewport.clientHeight
          - parseFloat(viewportStyle.paddingTop)
          - parseFloat(viewportStyle.paddingBottom);
        const contentWidth = Math.max(content.scrollWidth, content.offsetWidth);
        const contentHeight = Math.max(content.scrollHeight, content.offsetHeight);

        if (!availableWidth || !availableHeight || !contentWidth || !contentHeight) return;

        const nextScale = Math.min(
          1,
          (availableWidth - 4) / contentWidth,
          (availableHeight - 4) / contentHeight,
        );
        setSlideScale((scale) => Math.abs(scale - nextScale) < 0.002 ? scale : nextScale);
      });
    };

    const resizeObserver = new ResizeObserver(fitSlide);
    resizeObserver.observe(viewport);
    resizeObserver.observe(content);
    fitSlide();

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
    };
  }, [isOpen, currentSlideIndex, transitionKey, isFullscreen]);

  useEffect(() => {
    if (!isOpen || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const modal = modalRef.current;
    if (!modal) return;

    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;
    const applyPointer = () => {
      frame = 0;
      modal.style.setProperty('--ppt-pointer-x', String(pointerX));
      modal.style.setProperty('--ppt-pointer-y', String(pointerY));
      modal.style.setProperty('--ppt-parallax-x', `${pointerX * -4}px`);
      modal.style.setProperty('--ppt-parallax-y', `${pointerY * -3}px`);
      modal.style.setProperty('--ppt-camera-origin-x', `${50 + pointerX * 3}%`);
      modal.style.setProperty('--ppt-camera-origin-y', `${45 + pointerY * 3}%`);
      modal.style.setProperty('--ppt-camera-x', `${pointerY * -1}deg`);
      modal.style.setProperty('--ppt-camera-y', `${pointerX * 1.2}deg`);
      modal.style.setProperty('--ppt-network-camera-x', `${pointerY * 0.55}deg`);
      modal.style.setProperty('--ppt-network-camera-y', `${pointerX * -0.7}deg`);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const bounds = modal.getBoundingClientRect();
      pointerX = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2));
      pointerY = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2));
      if (!frame) frame = window.requestAnimationFrame(applyPointer);
    };
    const resetPointer = () => {
      pointerX = 0;
      pointerY = 0;
      if (!frame) frame = window.requestAnimationFrame(applyPointer);
    };

    modal.addEventListener('pointermove', onPointerMove);
    modal.addEventListener('pointerleave', resetPointer);
    return () => {
      modal.removeEventListener('pointermove', onPointerMove);
      modal.removeEventListener('pointerleave', resetPointer);
      window.cancelAnimationFrame(frame);
    };
  }, [isOpen]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      modalRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(true);
      window.setTimeout(() => setCopiedCode(false), 2000);
    }).catch(() => {});
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') {
        event.preventDefault();
        goToNext();
      } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault();
        goToPrev();
      } else if (event.key === 'Escape' && !document.fullscreenElement) {
        onClose();
      } else if (event.key === 'f' || event.key === 'F') {
        toggleFullscreen();
      } else if (event.key === 'Home') {
        event.preventDefault();
        goToSlide(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        goToSlide(totalSlides - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, goToNext, goToPrev, goToSlide, onClose, totalSlides]);

  // Autoplay handler (durasi lebih panjang agar transisi sinematik sempat selesai)
  useEffect(() => {
    if (!isOpen || !isAutoPlay) return;

    const interval = window.setInterval(() => {
      goToNext();
    }, 7000);

    return () => window.clearInterval(interval);
  }, [isOpen, isAutoPlay, goToNext]);

  // Prevent body scroll when open
  useEffect(() => {
    if (!isOpen) return;
    const root = document.documentElement;
    const originalRootOverflow = root.style.overflow;
    const originalOverflow = document.body.style.overflow;
    root.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      root.style.overflow = originalRootOverflow;
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Track fullscreen changes from ESC / browser controls
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  if (!isOpen) return null;

  const isClosing = currentSlide.id === contentSlideCount;
  const displaySlideNumber = currentSlide.isCover ? 'I' : String(currentSlide.id).padStart(2, '0');
  const contentMotionClasses = [
    `motion-slide-${currentSlide.id}`,
    isClosing ? 'motion-closing' : '',
    currentSlide.id === 6 || currentSlide.id === 12 ? 'motion-process' : '',
    currentSlide.id === 11 ? 'motion-comparison' : '',
    currentSlide.id === 13 ? 'motion-community' : '',
    currentSlide.codeSnippet ? 'motion-code' : '',
    currentSlide.quote ? 'motion-quote' : '',
    isExiting ? `is-exiting exit-${transitionDirection}` : '',
  ].filter(Boolean).join(' ');
  const contentClass = `ppt-content reveal-${transition} is-spatial enter-${transitionDirection} ${contentMotionClasses}${isClosing ? ' is-closing' : ''}`;

  return createPortal(
    <div
      className="ppt-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Presentasi Pengenalan Coding"
      ref={modalRef}
    >
      <div className="ppt-backdrop" onClick={onClose} />

      <div className="ppt-stage">
        <PptAmbientFx />
        <PptNetworkScene />
        {currentSlide.isCover && <PptDigitalCar />}

        {/* Main Slide Card Viewport */}
        <main
          className={`ppt-slide-viewport${currentSlide.isCover ? ' ppt-intro-viewport' : ''}`}
          ref={slideViewportRef}
          onPointerDown={handleTouchStart}
          onPointerUp={handleTouchEnd}
          onPointerCancel={() => { touchStartRef.current = null; }}
        >
          {currentSlide.isCover ? (
            <section
              className="ppt-intro-cover"
              aria-label="Slide intro Kelompok 6"
              ref={slideContentRef}
              style={{ '--ppt-fit-scale': slideScale } as CSSProperties}
              key={`cover-${transitionKey}`}
            >
              <h1 className="ppt-intro-title">Kelompok <span>6</span></h1>
            </section>
          ) : (
          <div
            className={`${contentClass} ppt-category-${currentSlide.category}`}
            data-slide-number={displaySlideNumber}
            ref={slideContentRef}
            style={{ '--ppt-fit-scale': slideScale } as CSSProperties}
            key={`${currentSlide.id}-${transitionKey}`}
          >
            {/* Slide Header Info */}
            <div className="ppt-slide-top anim-block" style={{ ['--d' as string]: 0 }}>
              <div className="ppt-badge-row">
                <span className="ppt-kicker-badge">{currentSlide.badge}</span>
                <span className="ppt-category-tag">
                  {currentSlide.category === 'intro' && 'PENGENALAN'}
                  {currentSlide.category === 'concepts' && 'PONDASI KODE'}
                  {currentSlide.category === 'languages' && 'EKOSISTEM'}
                  {currentSlide.category === 'career' && 'KARIR & TOOLS'}
                  {currentSlide.category === 'tips' && 'TIPS & STRATEGI'}
                </span>
              </div>
              <h2 className="ppt-slide-title" aria-label={currentSlide.title}>
                <span className="ppt-title-mask" aria-hidden="true">
                  <span className="ppt-title-line">{renderMotionText(currentSlide.title)}</span>
                </span>
              </h2>
              <p className="ppt-slide-subtitle" aria-label={currentSlide.subtitle}>
                <span aria-hidden="true">{renderMotionText(currentSlide.subtitle)}</span>
              </p>
            </div>

            {/* Slide Body Description */}
            <p className="ppt-slide-desc anim-block" style={{ ['--d' as string]: 1 }}>{currentSlide.description}</p>

            {/* Slide Interactive Columns / Content */}
            <div className="ppt-slide-grid">
              {currentSlide.bullets && currentSlide.bullets.length > 0 && (
                <div className="ppt-bullets-column">
                  {currentSlide.bullets.map((bullet, idx) => (
                    <div
                      className="ppt-bullet-card anim-block"
                      style={{ ['--d' as string]: idx + 2 }}
                      key={idx}
                    >
                      <span className="ppt-bullet-icon" aria-hidden="true">
                        {bullet.icon || <Sparkles size={16} />}
                      </span>
                      <div className="ppt-bullet-content">
                        <h4>{bullet.title}</h4>
                        <p>{bullet.desc}</p>
                      </div>
                      <span className="ppt-card-sweep" aria-hidden="true" />
                    </div>
                  ))}
                </div>
              )}

              {/* Code Snippet Box (if available) */}
              {currentSlide.codeSnippet && (
                <div className="ppt-code-box anim-block" style={{ ['--d' as string]: 3 }}>
                  <div className="ppt-code-header">
                    <span className="ppt-code-title">
                      <Code2 size={14} />
                      {currentSlide.codeSnippet.filename}
                    </span>
                    <button
                      type="button"
                      className="ppt-code-copy"
                      onClick={() => copyCode(currentSlide.codeSnippet?.code || '')}
                      title="Salin Kode"
                    >
                      {copiedCode ? <CheckCircle2 size={13} color="#4fe3d7" /> : <Terminal size={13} />}
                      <span>{copiedCode ? 'Disalin!' : 'Copy Code'}</span>
                    </button>
                  </div>
                  <pre className="ppt-code-pre">
                    <code>{currentSlide.codeSnippet.code}</code>
                  </pre>
                  <span className="ppt-code-scanline" aria-hidden="true" />
                </div>
              )}

              {/* Quote Box (if available) */}
              {currentSlide.quote && (
                <div className="ppt-quote-box anim-block" style={{ ['--d' as string]: 3 }}>
                  <span className="ppt-quote-decor">“</span>
                  <blockquote className="ppt-quote-text">
                    {currentSlide.quote.text}
                  </blockquote>
                  <cite className="ppt-quote-author">— {currentSlide.quote.author}</cite>
                </div>
              )}
            </div>

            {/* Slide Footer Tip */}
            {currentSlide.tips && (
              <div className="ppt-slide-tip anim-block" style={{ ['--d' as string]: 5 }}>
                <Lightbulb size={16} className="ppt-tip-icon" />
                <span><strong>Pro Tip:</strong> {currentSlide.tips}</span>
              </div>
            )}
          </div>
          )}
        </main>

        {transitionKey > 0 && transitionLockRef.current && (
          <PptTransitionBurst
            key={transitionKey}
            direction={transitionDirection}
            effectClass={slideEffect.className}
          />
        )}

        {/* Overlay transisi sinematik */}
        {spec.overlay && (
          <PptTransitionFx key={`${transition}-${transitionKey}`} kind={transition} variant={variant} />
        )}
      </div>

      <header className="ppt-topbar">
        <div className="ppt-topbar-left">
          <span className="ppt-brand-badge">
            <Presentation size={15} />
            <span>PPT MODE</span>
          </span>
          <span className="ppt-series-title">Pengenalan Dasar Coding &amp; Pemrograman</span>
          <span className="ppt-transition-tag" key={`${transition}-${transitionKey}`}>
            <i />
            {slideEffect.label}
          </span>
        </div>

        <div className="ppt-topbar-actions">
          <button
            type="button"
            className={`ppt-action-btn ${isAutoPlay ? 'active' : ''}`}
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            title={isAutoPlay ? 'Jeda Putar Otomatis' : 'Mulai Putar Otomatis'}
            aria-label="Autoplay"
          >
            {isAutoPlay ? <Pause size={15} /> : <Play size={15} />}
            <span>{isAutoPlay ? 'Auto (On)' : 'Auto'}</span>
          </button>

          <button
            type="button"
            className="ppt-action-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh (F)'}
            aria-label="Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>

          <button
            type="button"
            className="ppt-action-btn ppt-close-btn"
            onClick={onClose}
            title="Tutup Presentasi (Esc)"
            aria-label="Tutup Presentasi"
          >
            <X size={18} />
            <span>Tutup</span>
          </button>
        </div>
      </header>

      {/* Navigation Bar / Bottom Controller */}
      <footer className="ppt-footer-bar">
        <div className="ppt-nav-controls">
          <button
            type="button"
            className="ppt-nav-arrow"
            onClick={goToPrev}
            title="Slide Sebelumnya (Arrow Left)"
            aria-label="Previous Slide"
          >
            <ChevronLeft size={20} />
            <span>Prev</span>
          </button>

          <div className="ppt-progress-wrap">
            <span className="ppt-progress-label">
              <strong>{displaySlideNumber}</strong>
              <span className="ppt-progress-sep">/</span>
              {String(contentSlideCount).padStart(2, '0')}
            </span>
            <div className="ppt-progress-bar">
              <div
                className="ppt-progress-fill"
                key={`fill-${transitionKey}`}
                style={{ width: `${(currentSlide.id / contentSlideCount) * 100}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            className="ppt-nav-arrow"
            onClick={goToNext}
            title="Slide Berikutnya (Arrow Right / Space)"
            aria-label="Next Slide"
          >
            <span>Next</span>
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Thumbnail Dots Bar */}
        <div className="ppt-thumbnails">
          {pptSlides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              className={`ppt-thumb-dot ${index === currentSlideIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              title={slide.isCover ? 'Lompat ke Slide Intro: Kelompok 6' : `Lompat ke Slide ${slide.id}: ${slide.title}`}
              aria-label={slide.isCover ? 'Slide intro' : `Slide ${slide.id}`}
            >
              <span>{slide.isCover ? 'I' : String(slide.id).padStart(2, '0')}</span>
            </button>
          ))}
        </div>

        <div className="ppt-footer-hint">
          <span>Shortcut: <strong>←</strong> / <strong>→</strong> (Navigasi), <strong>Home</strong> / <strong>End</strong>, <strong>F</strong> (Layar Penuh), <strong>Esc</strong> (Tutup)</span>
        </div>
      </footer>
    </div>,
    document.body
  );
}
