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

const Admin = lazy(() => import('./pages/Admin'));
const isAdminRoute = () => window.location.hash.startsWith('#/admin');

export default function App() {
  const [admin, setAdmin] = useState(isAdminRoute);
  useEffect(() => {
    const onHash = () => setAdmin(isAdminRoute());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  if (admin) {
    return <Suspense fallback={null}><Admin /></Suspense>;
  }
  return <><OpeningIntro /><MotionEffects /><Effects3D /><ClickSparkles /><InteractiveHints /><Navbar /><main><Hero /><Marquee /><AboutSection /><ScheduleSection /><MembersSection /><GallerySection /><ContactSection /></main><Footer /></>;
}
