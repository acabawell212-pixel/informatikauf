import { ArrowDown, ArrowRight, ArrowUpRight, Sparkles } from 'lucide-react';

export function Hero() {
  return (
    <section className="hero wrap" id="home">
      <div className="hero-copy">
        <div className="hero-badge"><span className="live-dot" /> INFORMATICS COMMUNITY <span className="badge-year">EST. 2026/2027</span></div>
        <h1>Build.<br />Create.<br /><span>Innovate.</span></h1>
        <p className="hero-description">Ruang bertemu ide, tumbuh bersama teknologi, dan menciptakan dampak. Kami adalah keluarga Informatika Universitas Faletehan.</p>
        <div className="hero-actions">
          <a className="button button-primary" href="#about" data-hint="Lompat ke profil, visi, dan misi komunitas.">Kenali kami <ArrowRight size={16} /></a>
          <a className="button button-quiet" href="#schedule" data-hint="Lihat dan pilih jadwal mata kuliah per hari.">Lihat jadwal kuliah <ArrowDown size={15} /></a>
        </div>
        <div className="hero-social-proof"><div className="mini-avatars"><span>N</span><span>R</span><span>A</span><span>+</span></div><p><strong>Tempat semua ide dimulai.</strong><br />Komunitas belajar yang terbuka untukmu.</p></div>
      </div>
      <div className="hero-art" aria-label="Ilustrasi antarmuka coding dan jaringan teknologi" role="img">
        <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="art-glow" />
        <div className="art-grid" />
        <div className="float-tag tag-top"><span className="tag-icon"><Sparkles size={14} /></span><span><b>Ideas in motion</b><small>EST. 2026/2027 · BANTEN</small></span></div>
        <div className="code-window">
          <div className="window-bar"><div className="window-dots"><i /><i /><i /></div><span>future.tsx</span><ArrowUpRight size={13} /></div>
          <div className="code-lines">
            <p><span className="line-no">01</span><span className="code-purple">const</span> <span className="code-blue">future</span> = {'{'}</p>
            <p><span className="line-no">02</span>&nbsp;&nbsp; community: <span className="code-green">"Faletehan"</span>,</p>
            <p><span className="line-no">03</span>&nbsp;&nbsp; mindset: <span className="code-green">"always curious"</span>,</p>
            <p><span className="line-no">04</span>&nbsp;&nbsp; impact: <span className="code-orange">∞</span></p>
            <p><span className="line-no">05</span>{'}'};</p>
            <p className="code-comment"><span className="line-no">06</span>// Let's build it together <span className="cursor">▍</span></p>
          </div>
        </div>
        <div className="float-card card-activity"><span className="activity-pulse"><i /></span><span><small>UP NEXT</small><b>Build Night <em>04</em></b></span><ArrowUpRight size={15} /></div>
        <div className="float-card card-stats"><div className="stats-spark">✳</div><span><b>Learn by making.</b><small>One idea at a time.</small></span></div>
        <div className="art-coordinate">06°07' S &nbsp; 106°09' E<br />SERANG, INDONESIA</div>
        <div className="art-index">FIG. 01 <span>—</span> OUR PLAYGROUND</div>
      </div>
      <div className="hero-bottom"><span>SCROLL TO EXPLORE</span><div className="scroll-line" /><span>01 / 08</span></div>
    </section>
  );
}
