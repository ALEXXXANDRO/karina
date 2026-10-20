import { useEffect, useState } from 'react';

export function useMotionEnabled(enabled: boolean, extraQuery = '') {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setAllowed(false);
      return;
    }
    const query = window.matchMedia(
      `(prefers-reduced-motion: no-preference)${extraQuery ? ` and ${extraQuery}` : ''}`,
    );
    const update = () => setAllowed(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, [enabled, extraQuery]);

  return enabled && allowed;
}
