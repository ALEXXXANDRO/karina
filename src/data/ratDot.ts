import type { ProjectIntroData } from '../types/project';

export const ratDotProject = {
  id: 'rat-dot',
  titleLines: ['RAT DOT.'],
  facts: [
    { label: 'Services', values: ['Branding', 'Packaging'] },
    { label: 'Industry', values: ['Store', 'Jewellery'] },
    { label: 'Year', values: ['2026'] },
  ],
  description: {
    // The supplied RAT DOT frame repeats WOLFS copy. Preserve the reference
    // until approved RAT DOT text is available; do not invent a replacement.
    status: 'unconfirmed-reference-copy',
    paragraphs: [
      'WOLFS is a vintage store for those looking for clothes with character, not just something to wear. The brand is built around carefully selected vintage, street culture, freedom of self-expression, and a little bit of trouble.',
      'WOLFS visual language combines bold typography, ironic slogans, and dogs — independent, slightly angry, and always well-dressed. The brand doesn’t take fashion too seriously. It celebrates individuality, great finds, and clothes worth giving another life.',
    ],
  },
  illustration: {
    status: 'ready',
    src: 'assets/RatDot/rat-dot-cover.png',
    alt: 'Pink RAT DOT lettering on a black rat silhouette against a light background.',
  },
  footer: {
    author: 'KARINA SHISHKALOVA • 2026',
    project: 'RAT DOT',
  },
} as const satisfies ProjectIntroData;
