import type { ProjectIntroData } from '../types/project';

export const wolfsProject = {
  id: 'wolfs',
  titleLines: ['WOLFS'],
  facts: [
    { label: 'Services', values: ['Branding', 'Merchandising'] },
    { label: 'Industry', values: ['Store'] },
    { label: 'Year', values: ['2025'] },
  ],
  description: {
    status: 'confirmed',
    paragraphs: [
      'WOLFS is a vintage store for those looking for clothes with character, not just something to wear. The brand is built around carefully selected vintage, street culture, freedom of self-expression, and a little bit of trouble.',
      'WOLFS visual language combines bold typography, ironic slogans, and dogs — independent, slightly angry, and always well-dressed. The brand doesn’t take fashion too seriously. It celebrates individuality, great finds, and clothes worth giving another life.',
    ],
  },
  illustration: {
    status: 'ready',
    src: 'assets/wolfs/wolfs-cover.png',
    alt: 'Back view of a person wearing a white WOLFS graphic T-shirt and a black bucket hat.',
  },
  footer: {
    author: 'KARINA SHISHKALOVA • 2026',
    project: 'wolf',
  },
} as const satisfies ProjectIntroData;
