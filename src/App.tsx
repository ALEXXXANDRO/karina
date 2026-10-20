import Hero from './sections/Hero/Hero';
import ProjectIntro from './components/ProjectIntro/ProjectIntro';
import { ratDotProject } from './data/ratDot';

function App() {
  return (
    <main>
      <Hero />
      <ProjectIntro project={ratDotProject} />
    </main>
  );
}

export default App;
