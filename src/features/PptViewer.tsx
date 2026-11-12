import { createContext, useCallback, useContext, useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent as ReactKeyboardEvent, type ReactNode, type TouchEvent } from 'react';
import { createPortal } from 'react-dom';
import { useBodyScrollLock } from '../core/lib/hooks';
import { BookOpen, Check, ChevronLeft, ChevronRight, Cog, Image, Laptop, Lightbulb, Loader2, MessageCircle, Pencil, Save, Target, ThumbsDown, ThumbsUp, X } from 'lucide-react';
import { isAdminUser, loadPptTexts, savePptTexts, useAuthUser, type PptTexts } from '../services/firebase/pptTexts';

/*
 * Versi web dari template tugas PPT. Ukuran memakai unit `cqw` (lebar slide),
 * jadi slide ikut mengecil di HP.
 *
 * Semua teks slide ditulis lewat <T id="...">teks bawaan</T>. Admin (lihat
 * ADMIN_EMAILS) bisa mengubahnya langsung di slide; hasilnya disimpan di
 * Firestore (pptTemplate/main) dan terlihat oleh semua pengunjung.
 */

type TextState = { texts: PptTexts; editing: boolean; setText: (id: string, value: string) => void };
const TextContext = createContext<TextState>({ texts: {}, editing: false, setText: () => {} });

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
      className="ppt-editable"
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
  return <div className={`ppt-orbits ppt-orbits-${variant}`} aria-hidden="true"><i /><i /></div>;
}

function IconDot({ children, gold = false, size = 'md' }: { children: ReactNode; gold?: boolean; size?: 'sm' | 'md' | 'lg' }) {
  return <span className={`ppt-dot ppt-dot-${size}${gold ? ' is-gold' : ''}`}>{children}</span>;
}

function Content({ id, title, n, children }: { id: string; title: string; n: number; children: ReactNode }) {
  return (
    <div className="ppt-slide ppt-content">
      <span className="ppt-slide-sigil" aria-hidden="true">✧</span>
      <h2 className="ppt-title"><T id={`${id}.title`}>{title}</T></h2>
      <div className="ppt-body">{children}</div>
      <span className="ppt-footer"><T id="footer">Informatika · Universitas Faletehan</T></span>
      <span className="ppt-number">{n}</span>
    </div>
  );
}

const slides: ReactNode[] = [
  <div className="ppt-slide ppt-cover" key="cover">
    <span className="ppt-slide-sigil" aria-hidden="true">✧</span>
    <Orbits />
    <IconDot gold size="lg"><Laptop /></IconDot>
    <span className="ppt-kicker"><T id="cover.kicker">TUGAS · [NAMA MATA KULIAH]</T></span>
    <h1><T id="cover.title">[Judul Tugas]</T></h1>
    <p className="ppt-sub"><T id="cover.subtitle">[Subjudul atau topik singkat]</T></p>
    <div className="ppt-id-card">
      <small><T id="cover.byLabel">Disusun oleh</T></small>
      <b><T id="cover.author">[Nama Lengkap] · [NIM]</T></b>
      <span><T id="cover.lecturer">Dosen: [Nama Dosen] · [Tanggal]</T></span>
    </div>
  </div>,

  <Content id="members" title="Anggota Kelompok" n={2} key="members">
    <div className="ppt-members">
      {['A', 'B', 'C', 'D'].map((ini, i) => (
        <div className="ppt-card ppt-member" key={ini}>
          <span className={`ppt-avatar${i % 2 ? ' is-gold' : ''}`}><T id={`members.${i}.initial`}>{ini}</T></span>
          <b><T id={`members.${i}.name`}>{`[Nama Anggota ${i + 1}]`}</T></b>
          <span><T id={`members.${i}.nim`}>[NIM]</T></span>
          <em><T id={`members.${i}.task`}>[Tugas: materi / slide]</T></em>
        </div>
      ))}
    </div>
  </Content>,

  <Content id="toc" title="Daftar Isi" n={3} key="toc">
    <div className="ppt-split">
      <ol className="ppt-toc">
        {['Pendahuluan', '[Bagian Pembahasan 1]', '[Bagian Pembahasan 2]', 'Kesimpulan'].map((t, i) => (
          <li key={t} className={i % 2 ? '' : 'is-tinted'}><span>{String(i + 1).padStart(2, '0')}</span><T id={`toc.${i}`}>{t}</T></li>
        ))}
      </ol>
      <div className="ppt-side-art"><i /><IconDot size="lg"><BookOpen /></IconDot></div>
    </div>
  </Content>,

  <div className="ppt-slide ppt-divider" key="divider">
    <span className="ppt-slide-sigil" aria-hidden="true">✧</span>
    <Orbits variant="divider" />
    <span className="ppt-big-number"><T id="divider.number">01</T></span>
    <h2><T id="divider.title">Pendahuluan</T></h2>
    <p className="ppt-sub"><T id="divider.subtitle">[Satu kalimat tentang isi bagian ini]</T></p>
  </div>,

  <Content id="background" title="Latar Belakang" n={5} key="background">
    <div className="ppt-rows">
      {([
        [<Target key="t" />, 'Masalah', '[Jelaskan masalah atau pertanyaan yang dibahas dalam tugas ini.]'],
        [<Lightbulb key="l" />, 'Tujuan', '[Tuliskan apa yang ingin dicapai atau dijelaskan.]'],
        [<Cog key="c" />, 'Metode', '[Cara kamu mengerjakan: studi pustaka, eksperimen, survei, dll.]'],
      ] as const).map(([icon, h, d], i) => (
        <div className="ppt-row" key={h}>
          <IconDot gold={i === 1}>{icon}</IconDot>
          <div><b><T id={`background.${i}.head`}>{h}</T></b><p><T id={`background.${i}.desc`}>{d}</T></p></div>
        </div>
      ))}
    </div>
  </Content>,

  <Content id="text" title="[Judul Pembahasan]" n={6} key="text-image">
    <div className="ppt-split">
      <ul className="ppt-bullets">
        {['[Poin penting pertama tentang materi]', '[Poin penting kedua, singkat dan jelas]', '[Poin penting ketiga]', '[Contoh atau penjelasan tambahan]'].map((t, i) => (
          <li key={t}><T id={`text.${i}`}>{t}</T></li>
        ))}
      </ul>
      <div className="ppt-card ppt-image-slot"><Image /><span><T id="text.imageHint">Tempel gambar / diagram di sini</T></span></div>
    </div>
  </Content>,

  <Content id="stats" title="Data Penting" n={7} key="stats">
    <div className="ppt-stats">
      {[['[85%]', '[Keterangan angka pertama]'], ['[120]', '[Keterangan angka kedua]'], ['[3x]', '[Keterangan angka ketiga]']].map(([num, label], i) => (
        <div className={`ppt-card ppt-stat${i === 1 ? ' is-teal' : ''}`} key={num}>
          <strong><T id={`stats.${i}.num`}>{num}</T></strong><span><T id={`stats.${i}.label`}>{label}</T></span>
        </div>
      ))}
    </div>
    <p className="ppt-source"><T id="stats.source">Sumber: [tulis sumber data]</T></p>
  </Content>,

  <Content id="compare" title="Perbandingan" n={8} key="compare">
    <div className="ppt-compare">
      {([[<ThumbsUp key="u" />, '[Kelebihan / Opsi A]', false], [<ThumbsDown key="d" />, '[Kekurangan / Opsi B]', true]] as const).map(([icon, h, gold], c) => (
        <div className="ppt-card" key={h}>
          <div className="ppt-compare-head"><IconDot gold={gold} size="sm">{icon}</IconDot><b><T id={`compare.${c}.head`}>{h}</T></b></div>
          <ul className="ppt-bullets">
            {['[Poin pertama]', '[Poin kedua]', '[Poin ketiga]'].map((t, j) => <li key={t}><T id={`compare.${c}.${j}`}>{t}</T></li>)}
          </ul>
        </div>
      ))}
    </div>
  </Content>,

  <Content id="conclusion" title="Kesimpulan" n={9} key="conclusion">
    <p className="ppt-key-message"><T id="conclusion.message">[Tulis inti / pesan utama tugasmu dalam satu atau dua kalimat.]</T></p>
    <ul className="ppt-checks">
      {['[Poin kesimpulan pertama]', '[Poin kesimpulan kedua]', '[Saran atau langkah selanjutnya]'].map((t, i) => (
        <li key={t}><IconDot gold size="sm"><Check /></IconDot><T id={`conclusion.${i}`}>{t}</T></li>
      ))}
    </ul>
  </Content>,

  <Content id="refs" title="Daftar Pustaka" n={10} key="refs">
    <div className="ppt-split">
      <ol className="ppt-refs">
        {[
          '[Penulis]. ([Tahun]). [Judul buku atau artikel]. [Penerbit / Jurnal].',
          '[Penulis]. ([Tahun]). [Judul]. Diakses dari [URL] pada [tanggal].',
          '[Tambahkan sumber lain sesuai format yang diminta dosen]',
        ].map((t, i) => <li key={t}><T id={`refs.${i}`}>{t}</T></li>)}
      </ol>
      <div className="ppt-side-art is-gold"><i /><IconDot gold size="lg"><BookOpen /></IconDot></div>
    </div>
  </Content>,

  <div className="ppt-slide ppt-cover" key="thanks">
    <span className="ppt-slide-sigil" aria-hidden="true">✧</span>
    <Orbits />
    <IconDot gold size="lg"><MessageCircle /></IconDot>
    <span className="ppt-kicker"><T id="thanks.kicker">SESI TANYA JAWAB</T></span>
    <h1><T id="thanks.title">Terima Kasih</T></h1>
    <p className="ppt-sub"><T id="thanks.subtitle">Ada pertanyaan? Silakan bertanya.</T></p>
    <span className="ppt-closing"><T id="thanks.closing">[Nama / Kelompok] · Informatika Universitas Faletehan</T></span>
  </div>,
];

const slideNames = ['Cover', 'Anggota', 'Daftar Isi', 'Pembatas', 'Latar Belakang', 'Teks + Gambar', 'Data', 'Perbandingan', 'Kesimpulan', 'Pustaka', 'Penutup'];

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

  useEffect(() => {
    let alive = true;
    // Jangan tahan slide terlalu lama kalau koneksi lambat: tampilkan teks bawaan dulu.
    const fallback = window.setTimeout(() => alive && setReady(true), 2500);
    loadPptTexts().then((texts) => { if (alive) { setSaved(texts); setReady(true); } });
    return () => { alive = false; window.clearTimeout(fallback); };
  }, []);

  const dirty = editing && !sameTexts(draft, saved);
  // Ref ikut diperbarui seketika, jadi tombol Simpan selalu mengirim teks terbaru.
  const draftRef = useRef<PptTexts>({});
  const updateDraft = (next: PptTexts) => { draftRef.current = next; setDraft(next); };
  const setText = useCallback((id: string, value: string) => {
    const next = { ...draftRef.current };
    if (value) next[id] = value; else delete next[id];
    draftRef.current = next;
    setDraft(next);
  }, []);

  const startEdit = () => { updateDraft(saved); setEditing(true); setSaveState('idle'); setSaveError(''); };
  const cancelEdit = () => {
    if (dirty && !window.confirm('Perubahan teks belum disimpan. Buang perubahan?')) return;
    setEditing(false);
    setSaveState('idle');
  };
  const save = async () => {
    if (!user?.email) return;
    (document.activeElement as HTMLElement | null)?.blur?.(); // blur = teks yang sedang diketik masuk ke draft
    const toSave = draftRef.current;
    setSaveState('saving');
    setSaveError('');
    try {
      await savePptTexts(toSave, user.email);
      setSaved(toSave);
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
    if (dirty && !window.confirm('Perubahan teks belum disimpan. Tutup tanpa menyimpan?')) return;
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
  const textState: TextState = { texts: editing ? draft : saved, editing, setText };

  // Portal ke <body> supaya tidak terjebak di stacking context section (navbar jadi tertutup).
  return createPortal(
    <div className="ppt-viewer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <button className="ppt-close" type="button" onClick={close} aria-label="Tutup PPT" data-hint="Tutup tampilan PPT."><X size={20} /><span>Tutup</span></button>
      <div className={`ppt-panel${editing ? ' is-editing' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <span className="ppt-sigil" aria-hidden="true">✧</span>
        <span className="ppt-sigil is-small" aria-hidden="true">✦</span>
        <header className="ppt-panel-head">
          <div>
            <span className="eyebrow"><i />TEMPLATE TUGAS · SLIDE {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
            <h3>{title.split(' ').slice(0, -1).join(' ')} <span>{title.split(' ').slice(-1)}</span></h3>
          </div>
          {isAdmin && (
            <div className="ppt-admin-actions">
              {!editing ? (
                <>
                  {saveState === 'saved' && <span className="ppt-save-note"><Check size={13} /> Tersimpan</span>}
                  <button className="button button-outline" type="button" onClick={startEdit} disabled={!ready} data-hint="Ubah teks slide langsung di sini (khusus admin).">
                    <Pencil size={15} /> Edit teks
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
          <p className="ppt-edit-banner" role="status">
            <Pencil size={13} /> <span><b>Mode edit admin.</b> Klik teks di slide untuk mengubahnya, tekan Enter untuk selesai. Kosongkan teks untuk kembali ke teks bawaan. Pindah slide pakai tombol panah atau tab.</span>
          </p>
        )}
        {saveState === 'error' && <p className="ppt-edit-banner is-error" role="alert">{saveError}</p>}

        <div className="ppt-progress" aria-hidden="true"><i style={{ width: `${progress}%` }} /></div>

        <div className="ppt-stage-wrap" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <button className="ppt-arrow is-prev" type="button" onClick={() => go(-1)} disabled={index === 0} aria-label="Slide sebelumnya" data-hint="Slide sebelumnya (←)."><ChevronLeft size={22} /></button>
          <div className="ppt-stage">
            {ready ? (
              <TextContext.Provider value={textState}>
                <div className={`ppt-frame is-${dir}${darkSlides.has(index) ? ' is-dark' : ''}`} key={index} aria-live="polite" aria-label={`Slide ${index + 1}: ${slideNames[index]}`}>
                  {slides[index]}
                  <span className="ppt-corner" aria-hidden="true" />
                  <span className="ppt-sheen" aria-hidden="true" />
                </div>
              </TextContext.Provider>
            ) : (
              <div className="ppt-frame ppt-loading"><Loader2 size={22} className="spin" /> Memuat slide…</div>
            )}
          </div>
          <button className="ppt-arrow is-next" type="button" onClick={() => go(1)} disabled={index === total - 1} aria-label="Slide berikutnya" data-hint="Slide berikutnya (→)."><ChevronRight size={22} /></button>
        </div>

        <nav className="ppt-tabs" aria-label="Daftar slide" ref={tabsRef}>
          {slideNames.map((name, i) => (
            <button key={name} type="button" className={`ppt-tab${i === index ? ' active' : ''}`} onClick={() => goTo(i)} aria-current={i === index} data-hint={`Lompat ke slide ${name}.`}>
              <span>{String(i + 1).padStart(2, '0')}</span><strong>{name}</strong>
            </button>
          ))}
        </nav>
        <p className="ppt-help">Gunakan tombol panah ← → di keyboard, atau geser slide di HP.</p>
      </div>
    </div>,
    document.body,
  );
}
