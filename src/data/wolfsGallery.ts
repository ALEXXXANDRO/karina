import type { ProjectGalleryData } from '../types/gallery';

export const wolfsGallery = {
  id: 'wolfs-gallery',
  labelledBy: 'wolfs-title',
  variant: 'wolfs',
  grid: {
    columns: [1298, 572],
    rows: [999],
    columnGap: 11,
    rowGap: 0,
  },
  children: [
    {
      id: 'wolfs-work',
      kind: 'group',
      geometry: { width: 1298, height: 999 },
      placement: { column: 1, row: 1 },
      grid: {
        columns: [1298],
        rows: [435, 553],
        columnGap: 0,
        rowGap: 11,
      },
      children: [
        {
          id: 'wolfs-top',
          kind: 'group',
          geometry: { width: 1298, height: 435 },
          placement: { column: 1, row: 1 },
          grid: {
            columns: [569, 344, 363],
            rows: [435],
            columnGap: 11,
            rowGap: 0,
          },
          children: [
            {
              id: 'wolfs-sticker',
              kind: 'image',
              image: {
                src: 'assets/wolfs/gallery/gallery-01.png',
                alt: 'Round lavender WOLFS sticker on white fabric.',
                width: 569,
                height: 435,
              },
              tone: 'light',
              geometry: { width: 569, height: 435 },
              placement: { column: 1, row: 1 },
            },
            {
              id: 'wolfs-love-poster',
              kind: 'image',
              image: {
                src: 'assets/wolfs/gallery/gallery-02.png',
                alt: 'Lavender LOVE AT FIRST SPOT poster with illustrated WOLFS characters.',
                width: 344,
                height: 435,
              },
              tone: 'gray',
              geometry: { width: 344, height: 435 },
              placement: { column: 2, row: 1 },
            },
            {
              id: 'wolfs-t-shirt',
              kind: 'image',
              image: {
                src: 'assets/wolfs/gallery/gallery-03.png',
                alt: 'White WOLFS T-shirt with a WE SMELL A GOOD FIT graphic.',
                width: 363,
                height: 435,
              },
              tone: 'silver',
              geometry: { width: 363, height: 435 },
              placement: { column: 3, row: 1 },
            },
          ],
        },
        {
          id: 'wolfs-bottom',
          kind: 'group',
          geometry: { width: 1298, height: 553 },
          placement: { column: 1, row: 2 },
          grid: {
            // Empty tracks preserve the reference's asymmetric 11 / 10 px gaps.
            columns: [457, 11, 457, 10, 363],
            rows: [553],
            columnGap: 0,
            rowGap: 0,
          },
          children: [
            {
              id: 'wolfs-label',
              kind: 'image',
              image: {
                src: 'assets/wolfs/gallery/gallery-04.png',
                alt: 'Hand holding a yellow oval WOLFS label against lavender fabric.',
                width: 457,
                height: 553,
              },
              tone: 'gray',
              geometry: { width: 457, height: 553 },
              placement: { column: 1, row: 1 },
            },
            {
              id: 'wolfs-vintage-poster',
              kind: 'image',
              image: {
                src: 'assets/wolfs/gallery/gallery-05.png',
                alt: 'Yellow HEAVY VINTAGE poster with illustrated characters carrying a sofa.',
                width: 457,
                height: 553,
              },
              tone: 'pale',
              geometry: { width: 457, height: 553 },
              placement: { column: 3, row: 1 },
            },
            {
              id: 'wolfs-shopping-bag',
              kind: 'image',
              image: {
                src: 'assets/wolfs/gallery/gallery-06.png',
                alt: 'White WOLFS shopping bag with a RIDE DIRTY. DRESS CLEAN. graphic.',
                width: 363,
                height: 553,
              },
              tone: 'dark',
              geometry: { width: 363, height: 553 },
              placement: { column: 5, row: 1 },
            },
          ],
        },
      ],
    },
    {
      id: 'wolfs-brand-cards',
      kind: 'image',
      image: {
        src: 'assets/wolfs/gallery/gallery-07.png',
        alt: 'WOLFS brand card and loyalty card displayed together against a photograph.',
        width: 572,
        height: 999,
      },
      tone: 'pale',
      geometry: { width: 572, height: 999 },
      placement: { column: 2, row: 1 },
    },
  ],
  footer: {
    author: 'KARINA SHISHKALOVA • 2026',
    project: 'wolf',
  },
} as const satisfies ProjectGalleryData;
