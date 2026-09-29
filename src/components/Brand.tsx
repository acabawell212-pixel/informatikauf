import { ArrowUpRight } from 'lucide-react';

export function Brand() {
  return (
    <a className="brand" href="#home" aria-label="Informatika Faletehan beranda" data-hint="Kembali ke bagian atas halaman.">
      <span className="brand-mark"><span /></span>
      <span className="brand-copy"><strong>informatika</strong><small>UNIVERSITAS FALETEHAN</small></span>
    </a>
  );
}

export function ArrowLink({ href = '#contact', children }: { href?: string; children: React.ReactNode }) {
  return <a className="arrow-link" href={href} data-hint="Buka bagian informasi terkait.">{children}<ArrowUpRight size={15} /></a>;
}
