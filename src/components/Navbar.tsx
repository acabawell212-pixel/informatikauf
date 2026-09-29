import { useEffect, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { Brand } from './Brand';
import { navItems } from '../data/siteData';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
      <nav className="nav-shell wrap" aria-label="Navigasi utama">
        <Brand />
        <div className={`nav-links${open ? ' nav-open' : ''}`}>
          {navItems.map((item) => <a key={item.href} href={item.href} data-hint={item.hint} onClick={() => setOpen(false)}>{item.label}</a>)}
          <a className="nav-mobile-cta" href="#contact" data-hint="Buka formulir untuk menyapa komunitas." onClick={() => setOpen(false)}>Gabung komunitas <ArrowUpRight size={15} /></a>
        </div>
        <a className="nav-cta" href="#contact" data-hint="Buka formulir untuk menyapa komunitas.">Gabung komunitas <ArrowUpRight size={15} /></a>
        <button className="menu-toggle" aria-label={open ? 'Tutup menu' : 'Buka menu'} aria-expanded={open} data-hint={open ? 'Tutup daftar navigasi.' : 'Buka daftar navigasi.'} onClick={() => setOpen(!open)}>
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </nav>
    </header>
  );
}
