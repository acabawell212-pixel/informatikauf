import { ArrowUpRight, Linkedin, Send } from 'lucide-react';
import { members } from '../data/siteData';
import { SectionHeading } from '../components/SectionHeading';

export function MembersSection() {
  return (
    <section className="section members-section" id="members">
      <div className="wrap">
        <div className="section-row"><SectionHeading eyebrow="THE PEOPLE BEHIND IT" title={<>Dibangun oleh banyak<br /><span>cerita dan perspektif.</span></>} description="Kenalan dengan teman-teman yang membuat komunitas ini terus bergerak." /><a className="text-link section-side-link" href="#contact" data-hint="Lihat cara untuk bergabung atau menyapa komunitas.">Kenali komunitas <ArrowUpRight size={15} /></a></div>
        <div className="members-grid">{members.map((member, index) => <article className="member-card" key={member.name}>
          <div className={`member-portrait ${member.tone}`}><img className="member-photo" src={member.photo} alt="" loading="lazy" decoding="async" onError={(event) => { event.currentTarget.style.display = 'none'; const fallback = event.currentTarget.parentElement?.querySelector('.portrait-initials') as HTMLElement | null; if (fallback) fallback.style.display = 'grid'; }} /><span className="portrait-initials">{member.initials}</span><span className="portrait-orbit" /><span className="member-index">0{index + 1}</span><div className="member-socials"><a href="#contact" aria-label={`Profil sosial ${member.name}`} data-hint="Detail profil sosial akan ditambahkan."><Linkedin size={14} /></a><a href="#contact" aria-label={`Kontak ${member.name}`} data-hint="Buka formulir untuk menghubungi komunitas."><Send size={14} /></a></div></div>
          <div className="member-info"><div><h3>{member.name}</h3><span>{member.role}</span></div><small>{member.cohort}</small></div><div className="member-interest">INTEREST <b>{member.interest}</b></div>
        </article>)}</div>
        <div className="members-note"><div className="members-note-mark">+</div><p>Komunitas ini lebih besar dari satu tim kecil.<br /><strong>Selalu ada tempat untukmu.</strong></p><a className="button button-outline" href="#contact" data-hint="Buka formulir untuk bergabung dengan komunitas.">Jadi bagian dari kami <ArrowUpRight size={15} /></a></div>
        <p className="members-disclaimer">Foto profil dan nama di halaman ini adalah contoh. Ganti dengan anggota serta dokumentasi resmi komunitas.</p>
      </div>
    </section>
  );
}
