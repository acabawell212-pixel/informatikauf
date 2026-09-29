import { FormEvent, useState } from 'react';
import { ArrowRight, Check, Instagram, Mail, MapPin, Send } from 'lucide-react';
import { SectionHeading } from '../components/SectionHeading';

export function ContactSection() {
  const [sent, setSent] = useState(false);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSent(true); };
  return (
    <section className="section contact-section" id="contact"><div className="wrap contact-wrap">
      <div className="contact-copy"><SectionHeading eyebrow="YOUR NEXT CHAPTER" title={<>Karya hebat<br />dimulai dari <span>obrolan.</span></>} description="Mau gabung, kolaborasi, atau sekadar tanya-tanya? Pintu kami selalu terbuka." />
        <div className="contact-details"><a href="mailto:informatika@uf.ac.id" data-hint="Buka aplikasi email untuk mengirim pesan."><span><Mail size={16} /></span><div><small>EMAIL KAMI</small><b>informatika@uf.ac.id</b></div><ArrowRight size={15} /></a><div><span><MapPin size={16} /></span><div><small>TEMUKAN KAMI</small><b>Universitas Faletehan · Serang, Banten</b></div></div></div>
        <div className="contact-social"><small>IKUTI CERITA KAMI</small><a href="https://www.instagram.com/informatikauf/" target="_blank" rel="noreferrer" aria-label="Instagram Informatika Faletehan" data-hint="Buka Instagram resmi Informatika Faletehan."><Instagram size={16} /></a><a href="mailto:informatika@uf.ac.id" aria-label="Kirim email" data-hint="Kirim email ke Group Informatika."><Mail size={16} /></a></div>
      </div>
      <form className="contact-form" onSubmit={handleSubmit}><div className="form-top"><span className="form-kicker">SAY HELLO <i /></span><span className="form-number">FORM / 01</span></div><h3>Ada yang ingin<br />kamu ceritakan?</h3>
        <label>Nama kamu<input required name="name" placeholder="Nama lengkap" data-hint="Tulis nama yang ingin kami gunakan untuk menyapamu." /></label><label>Email aktif<input required type="email" name="email" placeholder="nama@email.com" data-hint="Isi email aktif agar kami bisa membalas pesanmu." /></label><label>Ceritakan sedikit<textarea required name="message" rows={3} placeholder="Ide, pertanyaan, atau sekadar halo..." data-hint="Tulis pesan atau pertanyaan yang ingin disampaikan." /></label>
        <button className="button button-primary form-submit" type="submit" data-hint="Kirim isi formulir ini. Mode demo belum mengirim email.">{sent ? <>Pesan tersimpan <Check size={16} /></> : <>Kirim pesan <Send size={15} /></>}</button>
        <p className="form-note">{sent ? 'Terima kasih! Form ini adalah demo—hubungkan ke layanan email untuk menerima pesan.' : 'Form demo · Hubungkan ke layanan backend untuk menerima pesan.'}</p>
      </form>
    </div></section>
  );
}
