import type { CSSProperties } from 'react';
import { heroObjects } from './heroObjects';
import HeroBean from './HeroBean';
import { useBeanInteraction } from './useBeanInteraction';
import { heroMotion } from './heroMotion';
import CursorTrail from '../../effects/CursorTrail/CursorTrail';
import './Hero.css';

function Hero() {
  const { containerRef, requestUpdate, registerClick, isParty } = useBeanInteraction();
  const motionStyle: CSSProperties & Record<`--hero-${string}`, string> = {
    '--hero-jump-height': `${heroMotion.flipHeight}px`,
    '--hero-jelly-height': `${heroMotion.jellyHeight}px`,
    '--hero-hop-height': `${heroMotion.hopHeight}px`,
    '--hero-wiggle-angle': `${heroMotion.wiggleAngle}deg`,
    '--hero-squash-y': `${heroMotion.squashY}`,
    '--hero-squash-x': `${1 / heroMotion.squashY}`,
    '--hero-stretch-y': `${heroMotion.stretchY}`,
    '--hero-stretch-x': `${1 / heroMotion.stretchY}`,
    '--hero-party-height': `${heroMotion.party.jumpHeight}px`,
    '--hero-party-duration': `${heroMotion.party.durationMs}ms`,
  };
  return (
    <section className="hero" aria-labelledby="hero-title" style={motionStyle}>
      <div className="hero__canvas">
        <div className="hero__decoration" ref={containerRef}>
          {heroObjects.filter((object) => object.status === 'ready').map((object, index) => (
            <HeroBean
              key={object.id}
              object={object}
              index={index}
              party={isParty}
              onInteraction={requestUpdate}
              onBeanClick={registerClick}
            />
          ))}
        </div>

        {isParty && <p className="hero__party-label" aria-hidden="true">BEAN PARTY!</p>}

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
      <CursorTrail />
    </section>
  );
}

export default Hero;
