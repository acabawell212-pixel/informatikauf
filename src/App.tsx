import { Suspense, lazy, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './features/Hero';
import { AboutSection } from './features/AboutSection';
import { ScheduleSection } from './features/ScheduleSection';
import { TemplateSection } from './features/TemplateSection';
import { MembersSection } from './features/MembersSection';
import { GallerySection } from './features/GallerySection';
import { ContactSection } from './features/ContactSection';
import { Footer } from './features/Footer';
import { MotionEffects } from './components/effects/MotionEffects';
import { InteractiveHints } from './components/effects/InteractiveHints';
import { OpeningIntro } from './features/OpeningIntro';
import { Effects3D } from './components/effects/Effects3D';
import { ClickSparkles } from './components/effects/ClickSparkles';
import { Marquee } from './components/Marquee';
import { PptModal } from './components/PptModal';
import { useHashRoute } from './core/lib/hooks';

const Admin = lazy(() => import('./features/Admin'));

// Halaman utama hanya menyusun bagian-bagiannya; logika tiap bagian ada di src/features.
export default function App() {
  const isAdmin = useHashRoute('#/admin');
  const [pptOpen, setPptOpen] = useState(false);
  const [introOpen, setIntroOpen] = useState(true);

  const handleOpenPpt = () => {
    if (introOpen) {
      // Tutup intro dulu sebelum membuka presentasi agar keduanya tidak tumpang tindih.
      setIntroOpen(false);
      return;
    }
    setPptOpen(true);
  };

  const handleIntroEnd = () => setIntroOpen(false);

  if (isAdmin) {
    return <Suspense fallback={null}><Admin /></Suspense>;
  }
  return (
    <>
      <OpeningIntro onIntroEnd={handleIntroEnd} />
      <MotionEffects />
      <Effects3D />
      <ClickSparkles />
      <InteractiveHints />
      <Navbar onOpenPpt={handleOpenPpt} />
      <main>
        <Hero onOpenPpt={handleOpenPpt} />
        <Marquee />
        <AboutSection />
        <ScheduleSection />
        <TemplateSection />
        <MembersSection />
        <GallerySection />
        <ContactSection />
      </main>
      <Footer />
      <PptModal isOpen={pptOpen} onClose={() => setPptOpen(false)} />
    </>
  );
}
