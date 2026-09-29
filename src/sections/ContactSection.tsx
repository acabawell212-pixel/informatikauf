import { FormEvent, useState } from 'react';
import { AlertCircle, ArrowRight, Check, Instagram, Loader2, Mail, MapPin, Send } from 'lucide-react';
import { SectionHeading } from '../components/SectionHeading';
import { firebaseReady } from '../lib/firebaseConfig';
import { getFirebase } from '../lib/firebase';

const CONTACT_EMAIL = 'informatikauf2026@gmail.com';

function gmailFallback(name: string, message: string) {
  const subject = `Kritik dari website Informatika: ${name}`;
  const body = `${message}

--
Nama: ${name}`;
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT_EMAIL}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
type SendState = 'idle' | 'sending' | 'sent' | 'error';

export function ContactSection() {
  const [state, setState] = useState<SendState>('idle');
  const [errorText, setErrorText] = useState('');
  const [fallbackUrl, setFallbackUrl] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (state === 'sending') return;
    const form = event.currentTarget;
    const data = new FormData(form);
    // kolom jebakan untuk bot: manusia tidak melihat/mengisinya
    if (data.get('_honey')) { setState('sent'); return; }

    setState('sending');
    setErrorText('');
    setFallbackUrl('');
    const name = String(data.get('name') ?? '').trim().slice(0, 80);
    const message = String(data.get('message') ?? '').trim().slice(0, 2000);

    // jeda antar kiriman (pembatas spam sederhana di sisi browser)
    try {
      const last = Number(window.localStorage.getItem('contact-last-sent') ?? 0);
      if (Date.now() - last < 30000) {
        setErrorText('Tunggu sebentar sebelum mengirim kritik lagi ya.');
        setState('error');
        return;
      }
    } catch { /* penyimpanan browser tidak tersedia: lanjutkan saja */ }

    const attempt = async () => {
      const { db } = await getFirebase();
      const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
      await addDoc(collection(db, 'messages'), { name, message, read: false, createdAt: serverTimestamp() });
    };
    try {
      if (!firebaseReady) throw new Error('not-configured');
      try { await attempt(); } catch { await new Promise((resolve) => setTimeout(resolve, 1200)); await attempt(); }
      try { window.localStorage.setItem('contact-last-sent', String(Date.now())); } catch { /* abaikan */ }
      form.reset();
      setState('sent');
    } catch {
      setFallbackUrl(gmailFallback(name, message));
      setErrorText('Kritik belum bisa dikirim lewat situs saat ini. Tulisanmu tidak hilang: kirim lewat Gmail dengan tombol di bawah (isinya sudah terisi otomatis).');
      setState('error');
    }
  };

  return (
    <section className="section contact-section" id="contact"><div className="wrap contact-wrap">
      <div className="contact-copy"><SectionHeading eyebrow="YOUR NEXT CHAPTER" title={<>Karya hebat<br />dimulai dari <span>obrolan.</span></>} description="Mau gabung, kolaborasi, atau sekadar tanya-tanya? Pintu kami selalu terbuka." />
        <div className="contact-details"><a href="https://mail.google.com/mail/?view=cm&fs=1&to=informatikauf2026@gmail.com&su=Halo%20Informatika%20Faletehan" target="_blank" rel="noreferrer" data-hint="Buka Gmail untuk mengirim email ke Group Informatika."><span><Mail size={16} /></span><div><small>EMAIL KAMI</small><b>informatikauf2026@gmail.com</b></div><ArrowRight size={15} /></a><div><span><MapPin size={16} /></span><div><small>TEMUKAN KAMI</small><b>Universitas Faletehan · Serang, Banten</b></div></div></div>
        <div className="contact-social"><small>IKUTI CERITA KAMI</small><a href="https://www.instagram.com/informatikauf/" target="_blank" rel="noreferrer" aria-label="Instagram Informatika Faletehan" data-hint="Buka Instagram resmi Informatika Faletehan."><Instagram size={16} /></a><a href="https://mail.google.com/mail/?view=cm&fs=1&to=informatikauf2026@gmail.com&su=Halo%20Informatika%20Faletehan" target="_blank" rel="noreferrer" aria-label="Kirim email" data-hint="Buka Gmail untuk email ke Group Informatika."><Mail size={16} /></a></div>
      </div>
      <form className="contact-form" onSubmit={handleSubmit}><div className="form-top"><span className="form-kicker">KRITIK & SARAN <i /></span><span className="form-number">FORM / 01</span></div><h3>Ada kritik atau<br />saran untuk kami?</h3>
        <label>Nama kamu<input required name="name" placeholder="Nama lengkap" data-hint="Tulis nama yang ingin kami gunakan untuk menyapamu." /></label><label>Kritik dan saranmu<textarea required name="message" rows={3} placeholder="Tulis kritik, saran, atau masukan untuk komunitas kami..." data-hint="Tulis kritik, saran, atau masukanmu. Boleh apa adanya." /></label>
        <input className="form-honey" name="_honey" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        <button className="button button-primary form-submit" type="submit" disabled={state === 'sending'} data-hint="Kirim kritik dan sarannya langsung ke tim Informatika.">
          {state === 'sending' ? <>Mengirim… <Loader2 size={16} className="spin" /></> : state === 'sent' ? <>Terkirim, mau kirim lagi? <Check size={16} /></> : <>Kirim kritik <Send size={15} /></>}
        </button>
        <p className={`form-note${state === 'error' ? ' is-error' : ''}${state === 'sent' ? ' is-ok' : ''}`} role="status" aria-live="polite">
          {state === 'sent' && <><Check size={13} /> Terima kasih atas kritiknya! Masukanmu sudah kami terima dan akan kami baca.</>}
          {state === 'error' && <><AlertCircle size={13} /> {errorText}</>}
          {(state === 'idle' || state === 'sending') && <>Kritikmu langsung masuk ke kotak masuk tim Informatika.</>}
        </p>
        {state === 'error' && fallbackUrl && (
          <a className="button button-outline form-fallback" href={fallbackUrl} target="_blank" rel="noreferrer">
            Kirim lewat Gmail <ArrowRight size={15} />
          </a>
        )}
      </form>
    </div></section>
  );
}
