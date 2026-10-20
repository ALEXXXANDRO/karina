import { heroObjects } from './heroObjects';
import HeroBean from './HeroBean';
import { useBeanInteraction } from './useBeanInteraction';
import './Hero.css';

function Hero() {
  const { containerRef, requestUpdate } = useBeanInteraction();
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__canvas">
        <div className="hero__decoration" ref={containerRef}>
          {heroObjects.filter((object) => object.status === 'ready').map((object) => (
            <HeroBean key={object.id} object={object} onInteraction={requestUpdate} />
          ))}
        </div>

        <div className="hero__copy">
          <h1 className="hero__title" id="hero-title">
            <span className="hero__title-glow" aria-hidden="true">PORTFOLIO</span>
            <span className="hero__title-text">PORTFOLIO</span>
          </h1>
          <p className="hero__subtitle">
            karina shishkalova • graphic designer • illustrator
          </p>
        </div>
      </div>
    </section>
  );
}

export default Hero;
