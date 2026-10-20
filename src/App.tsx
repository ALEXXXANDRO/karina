import Hero from './sections/Hero/Hero';
import ProjectIntro from './components/ProjectIntro/ProjectIntro';
import { ratDotProject } from './data/ratDot';
import ProjectGallery from './components/ProjectGallery/ProjectGallery';
import { ratDotGallery } from './data/ratDotGallery';
import { wolfsProject } from './data/wolfs';
import { wolfsGallery } from './data/wolfsGallery';
import './styles/wolfs.css';
import { mascotS7Project } from './data/mascotS7';
import { mascotS7Gallery } from './data/mascotS7Gallery';
import './styles/mascotS7.css';
import TravelerBean from './effects/TravelerBean/TravelerBean';
import GlobalAtmosphere from './effects/GlobalAtmosphere/GlobalAtmosphere';
import CursorTrail from './effects/CursorTrail/CursorTrail';

function App() {
  return (
    <>
      <GlobalAtmosphere />
      <main className="portfolio-content">
        <Hero />
        <ProjectIntro project={ratDotProject} />
        <ProjectGallery gallery={ratDotGallery} />
        <ProjectIntro project={wolfsProject} />
        <ProjectGallery gallery={wolfsGallery} />
        <ProjectIntro project={mascotS7Project} />
        <ProjectGallery gallery={mascotS7Gallery} />
      </main>
      <TravelerBean />
      <CursorTrail />
    </>
  );
}

export default App;
