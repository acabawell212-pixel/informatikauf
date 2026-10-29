import { Suspense, lazy, useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutSection } from './sections/AboutSection';
import { ScheduleSection } from './sections/ScheduleSection';
import { MembersSection } from './sections/MembersSection';
import { GallerySection } from './sections/GallerySection';
import { ContactSection } from './sections/ContactSection';
import { Footer } from './sections/Footer';
import { MotionEffects } from './components/MotionEffects';
import { InteractiveHints } from './components/InteractiveHints';
import { OpeningIntro } from './components/OpeningIntro';
import { Effects3D } from './components/Effects3D';
import { ClickSparkles } from './components/ClickSparkles';
import { Marquee } from './components/Marquee';
import { PptModal } from './components/PptModal';

const Admin = lazy(() => import('./pages/Admin'));
const isAdminRoute = () => window.location.hash.startsWith('#/admin');

export default function App() {
  const [admin, setAdmin] = useState(isAdminRoute);
  const [pptOpen, setPptOpen] = useState(false);
  const [introOpen, setIntroOpen] = useState(true);

  useEffect(() => {
    const onHash = () => setAdmin(isAdminRoute());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const handleOpenPpt = () => {
    if (introOpen) {
      // Tutup intro dulu sebelum membuka presentasi agar keduanya tidak tumpang tindih.
      setIntroOpen(false);
      return;
    }
    setPptOpen(true);
  };

  const handleIntroEnd = () => setIntroOpen(false);

  if (admin) {
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
        <MembersSection />
        <GallerySection />
        <ContactSection />
      </main>
      <Footer />
      <PptModal isOpen={pptOpen} onClose={() => setPptOpen(false)} />
    </>
  );
}
