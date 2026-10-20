import type { CSSProperties } from 'react';
import { heroObjects, heroReferenceSize } from './heroObjects';
import './Hero.css';

type HeroObjectStyle = CSSProperties & {
  '--object-x': string;
  '--object-y': string;
  '--object-width': string;
  '--object-ratio': string;
  '--object-compact-x': string;
  '--object-compact-y': string;
  '--object-compact-width': string;
};

function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__canvas">
        <div className="hero__decoration" aria-hidden="true">
          {heroObjects.filter((object) => object.status === 'ready').map((object) => {
            const { desktop, compact } = object;
            const style: HeroObjectStyle = {
              '--object-x': `${desktop.x / heroReferenceSize.width * 100}%`,
              '--object-y': `${desktop.y / heroReferenceSize.height * 100}%`,
              '--object-width': `${desktop.width / heroReferenceSize.width * 100}%`,
              '--object-ratio': `${desktop.width} / ${desktop.height}`,
              '--object-compact-x': `${compact.x}%`,
              '--object-compact-y': `${compact.y}%`,
              '--object-compact-width': `${compact.width}%`,
            };

            return (
              <img
                key={object.id}
                className="hero__object"
                data-hero-object={object.id}
                src={`${import.meta.env.BASE_URL}assets/hero/${object.file}`}
                alt=""
                draggable={false}
                style={style}
              />
            );
          })}
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
