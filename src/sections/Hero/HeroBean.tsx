import { useEffect, useRef, type CSSProperties } from 'react';
import { heroReferenceSize, type HeroObject } from './heroObjects';

interface HeroBeanProps {
  readonly object: HeroObject;
  readonly onInteraction: () => void;
}

type HeroObjectStyle = CSSProperties & Record<
  '--object-x' | '--object-y' | '--object-width' | '--object-ratio'
  | '--object-compact-x' | '--object-compact-y' | '--object-compact-width', string
>;

function HeroBean({ object, onInteraction }: HeroBeanProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const button = buttonRef.current;
    function finish(event: AnimationEvent) {
      if (event.target !== button || event.animationName !== 'hero-bean-tumble') return;
      if (rootRef.current) delete rootRef.current.dataset.spinning;
      onInteraction();
    }
    button?.addEventListener('animationend', finish);
    button?.addEventListener('animationcancel', finish);
    return () => {
      button?.removeEventListener('animationend', finish);
      button?.removeEventListener('animationcancel', finish);
    };
  }, [onInteraction]);

  function tumble() {
    const root = rootRef.current;
    if (!root || root.dataset.spinning === 'true'
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    root.dataset.spinning = 'true';
    onInteraction();
  }

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
    <div className="hero__object" data-hero-object={object.id} ref={rootRef} style={style}>
      <div className="hero__float">
        <div className="hero__reaction">
          <button
            className="hero__bean-button"
            type="button"
            aria-label={`Make the ${object.label} bean tumble`}
            onClick={tumble}
            ref={buttonRef}
          >
            <img
              className="hero__bean-image"
              src={`${import.meta.env.BASE_URL}assets/hero/${object.file}`}
              alt=""
              draggable={false}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

export default HeroBean;
