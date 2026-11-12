import { createContext, useCallback, useContext, useEffect, useRef, useState, type ChangeEvent, type ClipboardEvent, type KeyboardEvent as ReactKeyboardEvent, type ReactNode, type TouchEvent } from 'react';
import { createPortal } from 'react-dom';
import { useBodyScrollLock } from '../core/lib/hooks';
import { compressImage } from '../core/lib/image';
import { BookOpen, Check, ChevronLeft, ChevronRight, Cog, Image, ImagePlus, Laptop, Lightbulb, Loader2, MessageCircle, Pencil, Save, Target, ThumbsDown, ThumbsUp, Trash2, X } from 'lucide-react';
import { isAdminUser, loadPptImages, loadPptTexts, savePptImages, savePptTexts, useAuthUser, type PptImages, type PptTexts } from '../services/firebase/pptTexts';

/*
 * Versi web dari template tugas PPT. Ukuran memakai unit `cqw` (lebar slide),
 * jadi slide ikut mengecil di HP.
 *
 * Semua teks slide ditulis lewat <T id="...">teks bawaan</T>. Admin (lihat
 * ADMIN_EMAILS) bisa mengubahnya langsung di slide; hasilnya disimpan di
 * Firestore (pptTemplate/main) dan terlihat oleh semua pengunjung.
 */

type TextState = {
  texts: PptTexts;
  images: PptImages;
  editing: boolean;
  setText: (id: string, value: string) => void;
  setImage: (id: string, dataUrl: string) => void;
};
const TextContext = createContext<TextState>({ texts: {}, images: {}, editing: false, setText: () => {}, setImage: () => {} });

/**
 * Kotak gambar slide. Admin bisa memilih foto langsung dari galeri/kamera HP
 * (input file `accept="image/*"`); foto diperkecil dulu sebelum disimpan.
 */
function ImageSlot({ id, children }: { id: string; children: ReactNode }) {
  const { images, editing, setImage } = useContext(TextContext);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const src = images[id];

  const onPick = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // supaya file yang sama bisa dipilih ulang
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      setImage(id, await compressImage(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gambar gagal diproses');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`tpl-card tpl-image-slot${src ? ' has-image' : ''}`}>
      {src ? <img src={src} alt="" /> : children}
      {editing && (
        <div className="tpl-image-tools">
          <label className="tpl-image-btn">
            {busy ? <Loader2 className="spin" /> : <ImagePlus />}
            <span>{busy ? 'Memproses…' : src ? 'Ganti gambar' : 'Pilih gambar'}</span>
            <input type="file" accept="image/*" onChange={onPick} disabled={busy} />
          </label>
          {src && !busy && (
            <button className="tpl-image-btn is-ghost" type="button" onClick={() => setImage(id, '')}><Trash2 /><span>Hapus</span></button>
          )}
          {error && <span className="tpl-image-error">{error}</span>}
        </div>
      )}
    </div>
  );
}

/** Teks slide yang bisa diedit admin. Dikosongkan = kembali ke teks bawaan. */
function T({ id, children }: { id: string; children: string }) {
  const { texts, editing, setText } = useContext(TextContext);
  const value = texts[id]?.trim() ? texts[id] : children;
  if (!editing) return <>{value}</>;

  const onKeyDown = (event: ReactKeyboardEvent<HTMLSpanElement>) => {
    event.stopPropagation(); // jangan sampai panah/spasi memindah slide saat mengetik
    if (event.key === 'Enter' || event.key === 'Escape') { event.preventDefault(); event.currentTarget.blur(); }
  };
  const onPaste = (event: ClipboardEvent<HTMLSpanElement>) => {
    event.preventDefault(); // tempel sebagai teks biasa, tanpa format
    document.execCommand('insertText', false, event.clipboardData.getData('text/plain').replace(/\s+/g, ' '));
  };
  return (
    <span
      className="tpl-editable"
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      role="textbox"
      aria-label={`Edit teks: ${children}`}
      onKeyDown={onKeyDown}
      onPaste={onPaste}
      onBlur={(event) => setText(id, event.currentTarget.innerText.replace(/\s+/g, ' ').trim())}
    >{value}</span>
  );
}

function Orbits({ variant = 'cover' }: { variant?: 'cover' | 'divider' }) {
  return <div className={`tpl-orbits tpl-orbits-${variant}`} aria-hidden="true"><i /><i /></div>;
}

function IconDot({ children, gold = false, size = 'md' }: { children: ReactNode; gold?: boolean; size?: 'sm' | 'md' | 'lg' }) {
  return <span className={`tpl-dot tpl-dot-${size}${gold ? ' is-gold' : ''}`}>{children}</span>;
}

function Content({ id, title, n, children }: { id: string; title: string; n: number; children: ReactNode }) {
  return (
    <div className="tpl-slide tpl-content">
      <span className="tpl-slide-sigil" aria-hidden="true">✧</span>
      <h2 className="tpl-title"><T id={`${id}.title`}>{title}</T></h2>
      <div className="tpl-body">{children}</div>
      <span className="tpl-footer"><T id="footer">Informatika · Universitas Faletehan</T></span>
      <span className="tpl-number">{n}</span>
    </div>
  );
}

const slides: ReactNode[] = [
  <div className="tpl-slide tpl-cover" key="cover">
    <span className="tpl-slide-sigil" aria-hidden="true">✧</span>
    <Orbits />
    <IconDot gold size="lg"><Laptop /></IconDot>
    <span className="tpl-kicker"><T id="cover.kicker">PRESENTASI · INFORMATIKA FALETEHAN</T></span>
    <h1><T id="cover.title">Kenalan Yuk sama Dunia Coding</T></h1>
    <p className="tpl-sub"><T id="cover.subtitle">Dari nol, pelan-pelan, dan bareng-bareng.</T></p>
    <div className="tpl-id-card">
      <small><T id="cover.byLabel">Dibawakan oleh</T></small>
      <b><T id="cover.author">Keluarga Informatika · Angkatan 2026/2027</T></b>
      <span><T id="cover.lecturer">Universitas Faletehan · Serang, Banten</T></span>
    </div>
  </div>,

  <Content id="members" title="Di Informatika Kita Ngapain?" n={2} key="members">
    <div className="tpl-members">
      {[
        ['</>', 'Belajar Bareng', 'Kelas & diskusi rutin', 'Nggak ada pertanyaan bodoh'],
        ['{ }', 'Bikin Proyek', 'Dari web sampai game', 'Belajar sambil praktik'],
        ['★', 'Ikut Lomba', 'Asah skill, cari pengalaman', 'Menang kalah tetap belajar'],
        ['☕', 'Nongkrong', 'Ngopi sambil ngobrol', 'Teman seperjuangan'],
      ].map(([ini, name, sub, note], i) => (
        <div className="tpl-card tpl-member" key={name}>
          <span className={`tpl-avatar${i % 2 ? ' is-gold' : ''}`}><T id={`members.${i}.initial`}>{ini}</T></span>
          <b><T id={`members.${i}.name`}>{name}</T></b>
          <span><T id={`members.${i}.nim`}>{sub}</T></span>
          <em><T id={`members.${i}.task`}>{note}</T></em>
        </div>
      ))}
    </div>
  </Content>,

  <Content id="toc" title="Yang Mau Kita Obrolin" n={3} key="toc">
    <div className="tpl-split">
      <ol className="tpl-toc">
        {['Apa itu Informatika?', 'Coding itu sebenarnya apa?', 'Mitos dan fakta soal coding', 'Mulai dari mana?'].map((t, i) => (
          <li key={t} className={i % 2 ? '' : 'is-tinted'}><span>{String(i + 1).padStart(2, '0')}</span><T id={`toc.${i}`}>{t}</T></li>
        ))}
      </ol>
      <div className="tpl-side-art"><i /><IconDot size="lg"><BookOpen /></IconDot></div>
    </div>
  </Content>,

  <div className="tpl-slide tpl-divider" key="divider">
    <span className="tpl-slide-sigil" aria-hidden="true">✧</span>
    <Orbits variant="divider" />
    <span className="tpl-big-number"><T id="divider.number">01</T></span>
    <h2><T id="divider.title">Apa itu Informatika?</T></h2>
    <p className="tpl-sub"><T id="divider.subtitle">Lebih dari sekadar jago main komputer.</T></p>
  </div>,

  <Content id="background" title="Informatika Itu Belajar Apa?" n={5} key="background">
    <div className="tpl-rows">
      {([
        [<Target key="t" />, 'Berpikir Logis', 'Memecah masalah besar jadi langkah-langkah kecil yang bisa diselesaikan satu per satu.'],
        [<Lightbulb key="l" />, 'Membuat Program', 'Menulis instruksi supaya komputer bisa bantu pekerjaan kita jadi lebih cepat.'],
        [<Cog key="c" />, 'Mengelola Data', 'Mengolah informasi yang berantakan jadi sesuatu yang rapi dan berguna.'],
      ] as const).map(([icon, h, d], i) => (
        <div className="tpl-row" key={h}>
          <IconDot gold={i === 1}>{icon}</IconDot>
          <div><b><T id={`background.${i}.head`}>{h}</T></b><p><T id={`background.${i}.desc`}>{d}</T></p></div>
        </div>
      ))}
    </div>
  </Content>,

  <Content id="text" title="Coding Itu Sebenarnya Apa?" n={6} key="text-image">
    <div className="tpl-split">
      <ul className="tpl-bullets">
        {[
          'Coding artinya menulis perintah untuk komputer pakai bahasa yang dia ngerti.',
          'Mirip nulis resep masakan: urutannya harus jelas dan langkahnya lengkap.',
          'Bahasanya macam-macam, misalnya Python, JavaScript, dan C++.',
          'Hasilnya ada di sekitar kita: aplikasi, game, website, sampai mesin ATM.',
        ].map((t, i) => (
          <li key={t}><T id={`text.${i}`}>{t}</T></li>
        ))}
      </ul>
      <ImageSlot id="text-image"><Image /><span><T id="text.imageHint">print("Halo, Faletehan!")</T></span></ImageSlot>
    </div>
  </Content>,

  <Content id="stats" title="Kenapa Perlu Belajar?" n={7} key="stats">
    <div className="tpl-stats">
      {[['1', 'Baris kode sudah cukup buat bikin program pertamamu'], ['∞', 'Ide yang bisa kamu wujudkan jadi aplikasi sendiri'], ['Rp0', 'Banyak tempat belajar coding yang gratis']].map(([num, label], i) => (
        <div className={`tpl-card tpl-stat${i === 1 ? ' is-teal' : ''}`} key={num}>
          <strong><T id={`stats.${i}.num`}>{num}</T></strong><span><T id={`stats.${i}.label`}>{label}</T></span>
        </div>
      ))}
    </div>
    <p className="tpl-source"><T id="stats.source">Angka di atas cuma gambaran, bukan hasil survei.</T></p>
  </Content>,

  <Content id="compare" title="Mitos vs Fakta" n={8} key="compare">
    <div className="tpl-compare">
      {([
        [<ThumbsDown key="d" />, 'Katanya…', true, ['Harus jago matematika dulu', 'Harus punya laptop mahal', 'Cuma buat orang jenius']],
        [<ThumbsUp key="u" />, 'Padahal…', false, ['Yang penting mau mikir pelan-pelan', 'Laptop biasa pun sudah cukup', 'Semua orang bisa, asal rajin latihan']],
      ] as const).map(([icon, h, gold, points], c) => (
        <div className="tpl-card" key={h}>
          <div className="tpl-compare-head"><IconDot gold={gold} size="sm">{icon}</IconDot><b><T id={`compare.${c}.head`}>{h}</T></b></div>
          <ul className="tpl-bullets">
            {points.map((t, j) => <li key={t}><T id={`compare.${c}.${j}`}>{t}</T></li>)}
          </ul>
        </div>
      ))}
    </div>
  </Content>,

  <Content id="conclusion" title="Jadi, Mulai dari Mana?" n={9} key="conclusion">
    <p className="tpl-key-message"><T id="conclusion.message">Nggak usah nunggu merasa siap. Mulai aja dari satu baris kode hari ini.</T></p>
    <ul className="tpl-checks">
      {['Pilih satu bahasa dulu, misalnya Python', 'Latihan sedikit tapi rutin, 20 menit sehari sudah bagus', 'Belajar bareng teman biar nggak gampang menyerah'].map((t, i) => (
        <li key={t}><IconDot gold size="sm"><Check /></IconDot><T id={`conclusion.${i}`}>{t}</T></li>
      ))}
    </ul>
  </Content>,

  <Content id="refs" title="Tempat Belajar yang Asyik" n={10} key="refs">
    <div className="tpl-split">
      <ol className="tpl-refs">
        {[
          'Dicoding Academy: kelas dasar pemrograman berbahasa Indonesia.',
          'W3Schools: tutorial HTML, CSS, JavaScript, dan Python yang bisa langsung dicoba.',
          'freeCodeCamp: latihan coding gratis, dari dasar sampai bikin proyek.',
        ].map((t, i) => <li key={t}><T id={`refs.${i}`}>{t}</T></li>)}
      </ol>
      <div className="tpl-side-art is-gold"><i /><IconDot gold size="lg"><BookOpen /></IconDot></div>
    </div>
  </Content>,

  <div className="tpl-slide tpl-cover" key="thanks">
    <span className="tpl-slide-sigil" aria-hidden="true">✧</span>
    <Orbits />
    <IconDot gold size="lg"><MessageCircle /></IconDot>
    <span className="tpl-kicker"><T id="thanks.kicker">TERIMA KASIH SUDAH MENYIMAK</T></span>
    <h1><T id="thanks.title">Yuk, Ngoding Bareng!</T></h1>
    <p className="tpl-sub"><T id="thanks.subtitle">Ada pertanyaan? Tanya aja, nggak ada pertanyaan yang salah.</T></p>
    <span className="tpl-closing"><T id="thanks.closing">Informatika Universitas Faletehan · Belajar. Berkarya. Bertumbuh bersama.</T></span>
  </div>,
];

const slideNames = ['Pembuka', 'Kegiatan', 'Isi', 'Bagian 1', 'Informatika', 'Coding', 'Kenapa Belajar', 'Mitos & Fakta', 'Mulai dari Mana', 'Tempat Belajar', 'Penutup'];

type Dir = 'next' | 'prev';
type SaveState = 'idle' | 'saving' | 'saved' | 'error';

// Slide berlatar gelap (cover, pembatas, penutup) memakai bingkai emas yang lebih terang.
const darkSlides = new Set([0, 3, 10]);

const sameTexts = (a: PptTexts, b: PptTexts) => {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...keys].every((k) => (a[k] ?? '') === (b[k] ?? ''));
};

export function PptViewer({ title, onClose }: { title: string; onClose: () => void }) {
  const [{ index, dir }, setView] = useState<{ index: number; dir: Dir }>({ index: 0, dir: 'next' });
  const total = slides.length;
  const goTo = useCallback((target: number) => {
    setView((v) => {
      const next = Math.min(total - 1, Math.max(0, target));
      return next === v.index ? v : { index: next, dir: next > v.index ? 'next' : 'prev' };
    });
  }, [total]);
  const go = useCallback((step: number) => setView((v) => {
    const next = Math.min(total - 1, Math.max(0, v.index + step));
    return next === v.index ? v : { index: next, dir: step > 0 ? 'next' : 'prev' };
  }), [total]);

  // ----- Teks tersimpan & mode edit admin -----
  const user = useAuthUser();
  const isAdmin = isAdminUser(user);
  const [saved, setSaved] = useState<PptTexts>({});
  const [ready, setReady] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<PptTexts>({});
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveError, setSaveError] = useState('');

  const [savedImages, setSavedImages] = useState<PptImages>({});
  const [draftImages, setDraftImages] = useState<PptImages>({});
  const draftImagesRef = useRef<PptImages>({});

  useEffect(() => {
    let alive = true;
    // Jangan tahan slide terlalu lama kalau koneksi lambat: tampilkan teks bawaan dulu.
    const fallback = window.setTimeout(() => alive && setReady(true), 2500);
    loadPptTexts().then((texts) => { if (alive) { setSaved(texts); setReady(true); } });
    loadPptImages().then((images) => { if (alive) setSavedImages(images); });
    return () => { alive = false; window.clearTimeout(fallback); };
  }, []);

  const setImage = useCallback((id: string, dataUrl: string) => {
    const next = { ...draftImagesRef.current };
    if (dataUrl) next[id] = dataUrl; else delete next[id];
    draftImagesRef.current = next;
    setDraftImages(next);
  }, []);

  const dirty = editing && (!sameTexts(draft, saved) || !sameTexts(draftImages, savedImages));
  // Ref ikut diperbarui seketika, jadi tombol Simpan selalu mengirim teks terbaru.
  const draftRef = useRef<PptTexts>({});
  const updateDraft = (next: PptTexts) => { draftRef.current = next; setDraft(next); };
  const setText = useCallback((id: string, value: string) => {
    const next = { ...draftRef.current };
    if (value) next[id] = value; else delete next[id];
    draftRef.current = next;
    setDraft(next);
  }, []);

  const startEdit = () => {
    updateDraft(saved);
    draftImagesRef.current = savedImages;
    setDraftImages(savedImages);
    setEditing(true);
    setSaveState('idle');
    setSaveError('');
  };
  const cancelEdit = () => {
    if (dirty && !window.confirm('Perubahan slide belum disimpan. Buang perubahan?')) return;
    setEditing(false);
    setSaveState('idle');
  };
  const save = async () => {
    if (!user?.email) return;
    (document.activeElement as HTMLElement | null)?.blur?.(); // blur = teks yang sedang diketik masuk ke draft
    const toSave = draftRef.current;
    setSaveState('saving');
    setSaveError('');
    const imagesToSave = draftImagesRef.current;
    // Hanya gambar yang berubah yang dikirim (gambar besar, jangan tulis ulang tanpa perlu).
    const imageChanges: PptImages = {};
    for (const id of new Set([...Object.keys(imagesToSave), ...Object.keys(savedImages)])) {
      if ((imagesToSave[id] ?? '') !== (savedImages[id] ?? '')) imageChanges[id] = imagesToSave[id] ?? '';
    }
    try {
      if (!sameTexts(toSave, saved)) await savePptTexts(toSave, user.email);
      if (Object.keys(imageChanges).length) await savePptImages(imageChanges, user.email);
      setSaved(toSave);
      setSavedImages(imagesToSave);
      setEditing(false);
      setSaveState('saved');
    } catch (e) {
      const code = (e as { code?: string }).code ?? '';
      setSaveError(code === 'permission-denied'
        ? 'Ditolak Firestore. Pastikan aturan terbaru (firestore.rules) sudah di-deploy dan kamu login sebagai admin.'
        : 'Gagal menyimpan. Periksa koneksi lalu coba lagi.');
      setSaveState('error');
    }
  };

  const close = useCallback(() => {
    if (dirty && !window.confirm('Perubahan slide belum disimpan. Tutup tanpa menyimpan?')) return;
    onClose();
  }, [dirty, onClose]);

  useBodyScrollLock(true);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement | null)?.isContentEditable) return;
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') { event.preventDefault(); go(1); }
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') { event.preventDefault(); go(-1); }
      if (event.key === 'Home') goTo(0);
      if (event.key === 'End') goTo(total - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, goTo, total, close]);

  // Geser (swipe) di HP untuk pindah slide — dimatikan saat mode edit supaya tidak mengganggu memilih teks.
  const touchX = useRef<number | null>(null);
  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => { touchX.current = editing ? null : event.touches[0].clientX; };
  const onTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchX.current === null) return;
    const dx = event.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1);
  };

  // Tab slide aktif selalu terlihat (daftar tab bisa digeser di layar sempit).
  const tabsRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const tab = tabsRef.current?.children[index] as HTMLElement | undefined;
    tab?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [index]);

  const progress = ((index + 1) / total) * 100;
  const textState: TextState = { texts: editing ? draft : saved, images: editing ? draftImages : savedImages, editing, setText, setImage };

  // Portal ke <body> supaya tidak terjebak di stacking context section (navbar jadi tertutup).
  return createPortal(
    <div className="tpl-viewer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <button className="tpl-close" type="button" onClick={close} aria-label="Tutup PPT" data-hint="Tutup tampilan PPT."><X size={20} /><span>Tutup</span></button>
      <div className={`tpl-panel${editing ? ' is-editing' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <span className="tpl-sigil" aria-hidden="true">✧</span>
        <span className="tpl-sigil is-small" aria-hidden="true">✦</span>
        <header className="tpl-panel-head">
          <div>
            <span className="eyebrow"><i />TEMPLATE TUGAS · SLIDE {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
            <h3>{title.split(' ').slice(0, -1).join(' ')} <span>{title.split(' ').slice(-1)}</span></h3>
          </div>
          {isAdmin && (
            <div className="tpl-admin-actions">
              {!editing ? (
                <>
                  {saveState === 'saved' && <span className="tpl-save-note"><Check size={13} /> Tersimpan</span>}
                  <button className="button button-outline" type="button" onClick={startEdit} disabled={!ready} data-hint="Ubah teks dan gambar slide langsung di sini (khusus admin).">
                    <Pencil size={15} /> Edit slide
                  </button>
                </>
              ) : (
                <>
                  <button className="button button-outline" type="button" onClick={cancelEdit} disabled={saveState === 'saving'}>Batal</button>
                  <button className="button button-primary" type="button" onClick={save} disabled={saveState === 'saving' || !dirty} data-hint="Simpan teks supaya semua pengunjung melihatnya.">
                    {saveState === 'saving' ? <><Loader2 size={15} className="spin" /> Menyimpan…</> : <><Save size={15} /> Simpan</>}
                  </button>
                </>
              )}
            </div>
          )}
        </header>

        {editing && (
          <p className="tpl-edit-banner" role="status">
            <Pencil size={13} /> <span><b>Mode edit admin.</b> Ketuk teks di slide untuk mengubahnya (Enter = selesai, kosongkan = kembali ke teks bawaan). Di slide <b>Coding</b> ada tombol <b>Pilih gambar</b> untuk mengambil foto dari galeri HP. Jangan lupa tekan Simpan.</span>
          </p>
        )}
        {saveState === 'error' && <p className="tpl-edit-banner is-error" role="alert">{saveError}</p>}

        <div className="tpl-progress" aria-hidden="true"><i style={{ width: `${progress}%` }} /></div>

        <div className="tpl-stage-wrap" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <button className="tpl-arrow is-prev" type="button" onClick={() => go(-1)} disabled={index === 0} aria-label="Slide sebelumnya" data-hint="Slide sebelumnya (←)."><ChevronLeft size={22} /></button>
          <div className="tpl-stage">
            {ready ? (
              <TextContext.Provider value={textState}>
                <div className={`tpl-frame is-${dir}${darkSlides.has(index) ? ' is-dark' : ''}`} key={index} aria-live="polite" aria-label={`Slide ${index + 1}: ${slideNames[index]}`}>
                  {slides[index]}
                  <span className="tpl-corner" aria-hidden="true" />
                  <span className="tpl-sheen" aria-hidden="true" />
                </div>
              </TextContext.Provider>
            ) : (
              <div className="tpl-frame tpl-loading"><Loader2 size={22} className="spin" /> Memuat slide…</div>
            )}
          </div>
          <button className="tpl-arrow is-next" type="button" onClick={() => go(1)} disabled={index === total - 1} aria-label="Slide berikutnya" data-hint="Slide berikutnya (→)."><ChevronRight size={22} /></button>
        </div>

        <nav className="tpl-tabs" aria-label="Daftar slide" ref={tabsRef}>
          {slideNames.map((name, i) => (
            <button key={name} type="button" className={`tpl-tab${i === index ? ' active' : ''}`} onClick={() => goTo(i)} aria-current={i === index} data-hint={`Lompat ke slide ${name}.`}>
              <span>{String(i + 1).padStart(2, '0')}</span><strong>{name}</strong>
            </button>
          ))}
        </nav>
        <p className="tpl-help">Gunakan tombol panah ← → di keyboard, atau geser slide di HP.</p>
      </div>
    </div>,
    document.body,
  );
}
