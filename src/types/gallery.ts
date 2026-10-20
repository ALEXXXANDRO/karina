interface GalleryGeometry {
  readonly width: number;
  readonly height: number;
}

interface GalleryPlacement {
  readonly column: number;
  readonly row: number;
  readonly columnSpan?: number;
  readonly rowSpan?: number;
}

export interface GalleryGrid {
  readonly columns: readonly number[];
  readonly rows: readonly number[];
  readonly columnGap: number;
  readonly rowGap: number;
}

interface GalleryNodeBase {
  readonly id: string;
  readonly geometry: GalleryGeometry;
  readonly placement: GalleryPlacement;
}

interface GalleryCardBase extends GalleryNodeBase {
  readonly tone: 'light' | 'silver' | 'gray' | 'dark' | 'pale';
  readonly radius?: 'thumbnail';
}

export interface GalleryPlaceholder extends GalleryCardBase {
  readonly kind: 'placeholder';
}

export interface GalleryImage extends GalleryCardBase {
  readonly kind: 'image';
  readonly image: {
    readonly src: `assets/${string}`;
    readonly alt: string;
    readonly width: number;
    readonly height: number;
  };
}

export type GalleryCard = GalleryPlaceholder | GalleryImage;

export interface GalleryGroup extends GalleryNodeBase {
  readonly kind: 'group';
  readonly grid: GalleryGrid;
  readonly children: readonly GalleryNode[];
}

export type GalleryNode = GalleryCard | GalleryGroup;

export interface ProjectGalleryData {
  readonly id: string;
  readonly labelledBy: string;
  /** New variants provide their own grid and nested groups, not shared slots. */
  readonly variant: string;
  readonly grid: GalleryGrid;
  readonly children: readonly GalleryNode[];
  readonly footer?: {
    readonly author: string;
    readonly project: string;
  };
}
