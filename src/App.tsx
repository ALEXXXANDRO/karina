import Hero from './sections/Hero/Hero';
import ProjectIntro from './components/ProjectIntro/ProjectIntro';
import { ratDotProject } from './data/ratDot';
import ProjectGallery from './components/ProjectGallery/ProjectGallery';
import { ratDotGallery } from './data/ratDotGallery';
import { wolfsProject } from './data/wolfs';
import { wolfsGallery } from './data/wolfsGallery';
import './styles/wolfs.css';

function App() {
  return (
    <main>
      <Hero />
      <ProjectIntro project={ratDotProject} />
      <ProjectGallery gallery={ratDotGallery} />
      <ProjectIntro project={wolfsProject} />
      <ProjectGallery gallery={wolfsGallery} />
    </main>
  );
}

export default App;
