import { useEffect, useRef, type CSSProperties } from 'react';
import { heroReferenceSize, type HeroObject } from './heroObjects';
import { chooseBeanReaction, heroMotion, type BeanReaction } from './heroMotion';

interface HeroBeanProps {
  readonly object: HeroObject;
  readonly index: number;
  readonly party: boolean;
  readonly onInteraction: () => void;
  readonly onBeanClick: (id: string) => boolean;
}

type HeroObjectStyle = CSSProperties & Record<
  '--object-x' | '--object-y' | '--object-width' | '--object-ratio'
  | '--object-compact-x' | '--object-compact-y' | '--object-compact-width'
  | '--bean-party-delay' | '--bean-party-direction', string
>;

function HeroBean({ object, index, party, onInteraction, onBeanClick }: HeroBeanProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const previousReaction = useRef<BeanReaction | null>(null);

  useEffect(() => {
    const button = buttonRef.current;
    function finish(event: AnimationEvent) {
      const reaction = rootRef.current?.dataset.reaction;
      if (event.target !== button || !reaction || event.animationName !== `hero-bean-${reaction}`) return;
      if (rootRef.current) {
        delete rootRef.current.dataset.spinning;
        delete rootRef.current.dataset.reaction;
      }
      button?.style.removeProperty('--bean-action-duration');
      onInteraction();
    }
    button?.addEventListener('animationend', finish);
    button?.addEventListener('animationcancel', finish);
    return () => {
      button?.removeEventListener('animationend', finish);
      button?.removeEventListener('animationcancel', finish);
    };
  }, [onInteraction]);

  function react() {
    const root = rootRef.current;
    if (!root || party || root.dataset.spinning === 'true' || document.hidden
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!onBeanClick(object.id)) return;
    const reaction = chooseBeanReaction(previousReaction.current);
    previousReaction.current = reaction;
    buttonRef.current?.style.setProperty('--bean-action-duration', `${heroMotion.durationsMs[reaction]}ms`);
    root.dataset.reaction = reaction;
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
    '--bean-party-delay': `${index % 4 * heroMotion.party.staggerMs}ms`,
    '--bean-party-direction': index % 2 ? '-1' : '1',
  };

  return (
    <div className="hero__object" data-hero-object={object.id} ref={rootRef} style={style}>
      <div className="hero__float">
        <div className="hero__reaction">
          <button
            className="hero__bean-button"
            type="button"
            aria-label={`Play with the ${object.label} bean`}
            aria-disabled={party || undefined}
            onClick={react}
            ref={buttonRef}
          >
            <span className="hero__tilt">
              <span className="hero__party">
                <img
                  className="hero__bean-image"
                  src={`${import.meta.env.BASE_URL}assets/hero/${object.file}`}
                  alt=""
                  draggable={false}
                />
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default HeroBean;
