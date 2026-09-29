import { ArrowUpRight, Compass, HeartHandshake, Lightbulb, Target } from 'lucide-react';
import { CountUp } from '../components/CountUp';
import { SectionHeading } from '../components/SectionHeading';

const values = [
  { icon: Lightbulb, title: 'Rasa ingin tahu', text: 'Terus bertanya, bereksperimen, dan berani mencoba hal baru.' },
  { icon: HeartHandshake, title: 'Tumbuh bersama', text: 'Berbagi pengetahuan karena kemajuan terbaik adalah kemajuan kolektif.' },
  { icon: Compass, title: 'Berdampak nyata', text: 'Teknologi bukan sekadar kode, tapi cara untuk membantu sesama.' },
];

export function AboutSection() {
  return (
    <section className="section about-section" id="about">
      <div className="wrap">
        <div className="about-top">
          <SectionHeading eyebrow="WHO WE ARE" title={<>Satu ruang.<br /><span>Banyak kemungkinan.</span></>} />
          <div className="about-intro"><p>Group Informatika Universitas Faletehan adalah rumah bagi mahasiswa yang percaya bahwa teknologi punya kekuatan untuk membuat hidup lebih baik.</p><p>Kami belajar, berkarya, dan saling menguatkan—dari ide pertama sampai solusi yang bisa dirasakan banyak orang.</p><a className="text-link" href="#contact" data-hint="Lanjut ke kontak untuk mengenal komunitas lebih jauh.">Cerita kami <ArrowUpRight size={15} /></a></div>
        </div>
        <div className="principles-grid">
          <article className="principle-card vision-card"><span className="principle-index">01 / VISI</span><div className="principle-symbol"><Target size={20} /></div><h3>Teknologi untuk<br />masa depan yang lebih baik.</h3><p>Menjadi komunitas informatika yang inklusif, adaptif, dan berkontribusi nyata bagi masyarakat.</p><div className="vision-lines"><i /><i /><i /><i /></div></article>
          <article className="principle-card mission-card"><span className="principle-index">02 / MISI</span><h3>Belajar bersama,<br />bertumbuh tanpa batas.</h3><ul><li><span>01</span>Memfasilitasi pembelajaran teknologi yang relevan.</li><li><span>02</span>Mendorong kolaborasi dan karya lintas disiplin.</li><li><span>03</span>Membuka ruang kontribusi untuk semua.</li></ul></article>
          <div className="values-column"><span className="principle-index">03 / NILAI KAMI</span>{values.map(({ icon: Icon, title, text }, index) => <article className="value-row" key={title}><span className="value-icon"><Icon size={17} /></span><div><h3>{title}</h3><p>{text}</p></div><span className="value-num">0{index + 1}</span></article>)}</div>
        </div>
        <div className="stats-strip"><div><strong><CountUp target={8} pad={2} /><span>+</span></strong><small>Tahun bertumbuh</small></div><div><strong><CountUp target={120} /><span>+</span></strong><small>Teman seperjalanan</small></div><div><strong><CountUp target={24} /></strong><small>Project kolaboratif</small></div><div><strong>∞</strong><small>Ide untuk dicoba</small></div><div className="stat-note">Angka hanyalah awal.<br /><b>Cerita kita terus berjalan.</b></div></div>
      </div>
    </section>
  );
}
