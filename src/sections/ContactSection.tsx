import { FormEvent, useState } from 'react';
import { AlertCircle, ArrowRight, Check, Instagram, Loader2, Mail, MapPin, Send } from 'lucide-react';
import { SectionHeading } from '../components/SectionHeading';

const CONTACT_EMAIL = 'informatikauf2026@gmail.com';

function gmailFallback(name: string, email: string, message: string) {
  const subject = `Pesan dari website Informatika: ${name}`;
  const body = `${message}

--
Nama: ${name}
Email: ${email}`;
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
    const payload = JSON.stringify({
      name: data.get('name'),
      email: data.get('email'),
      message: data.get('message'),
      _subject: `Pesan baru dari website Informatika: ${String(data.get('name') ?? '')}`,
      _template: 'table',
      _captcha: 'false',
    });
    const attempt = async () => {
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 12000);
      try {
        const response = await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: payload,
          signal: controller.signal,
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || result.success === 'false' || result.success === false) {
          throw new Error(typeof result.message === 'string' ? result.message : 'Gagal mengirim');
        }
      } finally {
        window.clearTimeout(timer);
      }
    };
    try {
      try { await attempt(); } catch { await new Promise((resolve) => setTimeout(resolve, 1200)); await attempt(); }
      form.reset();
      setState('sent');
    } catch {
      setFallbackUrl(gmailFallback(String(data.get('name') ?? ''), String(data.get('email') ?? ''), String(data.get('message') ?? '')));
      setErrorText('Layanan pengiriman sedang gangguan. Pesanmu belum terkirim, tapi tidak hilang: kirim lewat Gmail dengan tombol di bawah (isinya sudah terisi otomatis).');
      setState('error');
    }
  };

  return (
    <section className="section contact-section" id="contact"><div className="wrap contact-wrap">
      <div className="contact-copy"><SectionHeading eyebrow="YOUR NEXT CHAPTER" title={<>Karya hebat<br />dimulai dari <span>obrolan.</span></>} description="Mau gabung, kolaborasi, atau sekadar tanya-tanya? Pintu kami selalu terbuka." />
        <div className="contact-details"><a href="https://mail.google.com/mail/?view=cm&fs=1&to=informatikauf2026@gmail.com&su=Halo%20Informatika%20Faletehan" target="_blank" rel="noreferrer" data-hint="Buka Gmail untuk mengirim email ke Group Informatika."><span><Mail size={16} /></span><div><small>EMAIL KAMI</small><b>informatikauf2026@gmail.com</b></div><ArrowRight size={15} /></a><div><span><MapPin size={16} /></span><div><small>TEMUKAN KAMI</small><b>Universitas Faletehan · Serang, Banten</b></div></div></div>
        <div className="contact-social"><small>IKUTI CERITA KAMI</small><a href="https://www.instagram.com/informatikauf/" target="_blank" rel="noreferrer" aria-label="Instagram Informatika Faletehan" data-hint="Buka Instagram resmi Informatika Faletehan."><Instagram size={16} /></a><a href="https://mail.google.com/mail/?view=cm&fs=1&to=informatikauf2026@gmail.com&su=Halo%20Informatika%20Faletehan" target="_blank" rel="noreferrer" aria-label="Kirim email" data-hint="Buka Gmail untuk email ke Group Informatika."><Mail size={16} /></a></div>
      </div>
      <form className="contact-form" onSubmit={handleSubmit}><div className="form-top"><span className="form-kicker">SAY HELLO <i /></span><span className="form-number">FORM / 01</span></div><h3>Ada yang ingin<br />kamu ceritakan?</h3>
        <label>Nama kamu<input required name="name" placeholder="Nama lengkap" data-hint="Tulis nama yang ingin kami gunakan untuk menyapamu." /></label><label>Email aktif<input required type="email" name="email" placeholder="nama@email.com" data-hint="Isi email aktif agar kami bisa membalas pesanmu." /></label><label>Ceritakan sedikit<textarea required name="message" rows={3} placeholder="Ide, pertanyaan, atau sekadar halo..." data-hint="Tulis pesan atau pertanyaan yang ingin disampaikan." /></label>
        <input className="form-honey" name="_honey" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        <button className="button button-primary form-submit" type="submit" disabled={state === 'sending'} data-hint="Kirim pesanmu langsung ke email Group Informatika.">
          {state === 'sending' ? <>Mengirim… <Loader2 size={16} className="spin" /></> : state === 'sent' ? <>Terkirim, kirim lagi? <Check size={16} /></> : <>Kirim pesan <Send size={15} /></>}
        </button>
        <p className={`form-note${state === 'error' ? ' is-error' : ''}${state === 'sent' ? ' is-ok' : ''}`} role="status" aria-live="polite">
          {state === 'sent' && <><Check size={13} /> Terima kasih! Pesanmu sudah terkirim ke tim Informatika. Kami balas ke emailmu secepatnya.</>}
          {state === 'error' && <><AlertCircle size={13} /> {errorText}</>}
          {(state === 'idle' || state === 'sending') && <>Pesan dikirim langsung ke {CONTACT_EMAIL}</>}
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
