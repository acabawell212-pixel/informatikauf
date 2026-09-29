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

export default function App() {
  return <><OpeningIntro /><MotionEffects /><Effects3D /><ClickSparkles /><InteractiveHints /><Navbar /><main><Hero /><Marquee /><AboutSection /><ScheduleSection /><MembersSection /><GallerySection /><ContactSection /></main><Footer /></>;
}
