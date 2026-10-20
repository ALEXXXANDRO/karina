import type { ProjectGalleryData } from '../types/gallery';

export const mascotS7Gallery = {
  id: 'mascot-s7-gallery',
  labelledBy: 'mascot-s7-title',
  variant: 's7',
  grid: {
    columns: [1105, 765],
    rows: [999],
    columnGap: 11,
    rowGap: 0,
  },
  children: [
    {
      id: 's7-work',
      kind: 'group',
      geometry: { width: 1105, height: 999 },
      placement: { column: 1, row: 1 },
      grid: {
        columns: [1105],
        rows: [435, 553],
        columnGap: 0,
        rowGap: 11,
      },
      children: [
        {
          id: 's7-top',
          kind: 'group',
          geometry: { width: 1105, height: 435 },
          placement: { column: 1, row: 1 },
          grid: {
            columns: [569, 525],
            rows: [435],
            columnGap: 11,
            rowGap: 0,
          },
          children: [
            {
              id: 's7-badge',
              kind: 'image',
              image: {
                src: 'assets/s7/gallery/gallery-01.png',
                alt: 'Green badge holder and white S7 mascot keyring.',
                width: 569,
                height: 435,
              },
              tone: 'light',
              geometry: { width: 569, height: 435 },
              placement: { column: 1, row: 1 },
            },
            {
              id: 's7-pins',
              kind: 'image',
              image: {
                src: 'assets/s7/gallery/gallery-02.png',
                alt: 'Four cloud-shaped mascot pins on a green shirt.',
                width: 525,
                height: 435,
              },
              tone: 'silver',
              geometry: { width: 525, height: 435 },
              placement: { column: 2, row: 1 },
            },
          ],
        },
        {
          id: 's7-bottom',
          kind: 'group',
          geometry: { width: 1105, height: 553 },
          placement: { column: 1, row: 2 },
          grid: {
            columns: [457, 637],
            rows: [553],
            columnGap: 11,
            rowGap: 0,
          },
          children: [
            {
              id: 's7-clothing',
              kind: 'image',
              image: {
                src: 'assets/s7/gallery/gallery-03.png',
                alt: 'S7 mascot cap, sock and drawstring bags.',
                width: 457,
                height: 553,
              },
              tone: 'gray',
              geometry: { width: 457, height: 553 },
              placement: { column: 1, row: 1 },
            },
            {
              id: 's7-notebooks',
              kind: 'image',
              image: {
                src: 'assets/s7/gallery/gallery-04.png',
                alt: 'Three S7 mascot pins mounted on branded cards.',
                width: 637,
                height: 553,
              },
              tone: 'pale',
              geometry: { width: 637, height: 553 },
              placement: { column: 2, row: 1 },
            },
          ],
        },
      ],
    },
    {
      id: 's7-gift-box',
      kind: 'image',
      image: {
        src: 'assets/s7/gallery/gallery-05.png',
        alt: 'S7 gift box containing mascot merchandise, stationery and a cup.',
        width: 765,
        height: 999,
      },
      tone: 'dark',
      geometry: { width: 765, height: 999 },
      placement: { column: 2, row: 1 },
    },
  ],
  footer: {
    author: 'KARINA SHISHKALOVA • 2026',
    project: 'wolf',
  },
} as const satisfies ProjectGalleryData;
