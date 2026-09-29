import { ArrowUpRight, Instagram } from 'lucide-react';
import { Brand } from '../components/Brand';
import { navItems } from '../data/siteData';

export function Footer() {
  return <footer className="site-footer"><div className="wrap"><div className="footer-top"><div><Brand /><p>Ruang bertemu ide, tumbuh bersama teknologi,<br />dan menciptakan dampak.</p></div><div className="footer-links"><span>JELAJAHI</span><div>{navItems.map((item) => <a key={item.href} href={item.href} data-hint={item.hint}>{item.label}</a>)}</div></div><div className="footer-social"><span>STAY IN THE LOOP</span><a href="https://www.instagram.com/informatikauf/" target="_blank" rel="noreferrer" data-hint="Buka Instagram resmi Informatika Faletehan.">Instagram <Instagram size={14} /><ArrowUpRight size={13} /></a><a href="https://mail.google.com/mail/?view=cm&fs=1&to=informatikauf2026@gmail.com&su=Halo%20Informatika%20Faletehan" target="_blank" rel="noreferrer" data-hint="Buka Gmail untuk menghubungi kami.">Kirim email <ArrowUpRight size={13} /></a></div></div><div className="footer-bottom"><span>© 2026 Group Informatika Universitas Faletehan</span><span>MADE WITH CURIOSITY <i>✳</i> IN SERANG, ID</span><a href="#home" data-hint="Kembali ke bagian paling atas.">Kembali ke atas ↑</a></div></div></footer>;
}
