import Hero from './sections/Hero/Hero';
import ProjectIntro from './components/ProjectIntro/ProjectIntro';
import { ratDotProject } from './data/ratDot';
import ProjectGallery from './components/ProjectGallery/ProjectGallery';
import { ratDotGallery } from './data/ratDotGallery';

function App() {
  return (
    <main>
      <Hero />
      <ProjectIntro project={ratDotProject} />
      <ProjectGallery gallery={ratDotGallery} />
    </main>
  );
}

export default App;
