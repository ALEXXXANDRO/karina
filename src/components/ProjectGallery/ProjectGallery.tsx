import type { CSSProperties } from 'react';
import type { GalleryGrid, GalleryNode, ProjectGalleryData } from '../../types/gallery';
import './ProjectGallery.css';

type GridStyle = CSSProperties & {
  '--gallery-columns': string;
  '--gallery-rows': string;
  '--gallery-column-gap': string;
  '--gallery-row-gap': string;
};

type ItemStyle = CSSProperties & {
  '--item-column': string;
  '--item-row': string;
  '--item-ratio': string;
};

function getGridStyle(grid: GalleryGrid): GridStyle {
  const width = grid.columns.reduce((sum, track) => sum + track, 0)
    + grid.columnGap * (grid.columns.length - 1);
  const height = grid.rows.reduce((sum, track) => sum + track, 0)
    + grid.rowGap * (grid.rows.length - 1);

  return {
    '--gallery-columns': grid.columns.map((width) => `minmax(0, ${width}fr)`).join(' '),
    '--gallery-rows': grid.rows.map((height) => `minmax(0, ${height}fr)`).join(' '),
    '--gallery-column-gap': `${grid.columnGap / width * 100}%`,
    '--gallery-row-gap': `${grid.rowGap / height * 100}%`,
  };
}

function GalleryItem({ item }: { readonly item: GalleryNode }) {
  const style: ItemStyle = {
    '--item-column': `${item.placement.column} / span ${item.placement.columnSpan ?? 1}`,
    '--item-row': `${item.placement.row} / span ${item.placement.rowSpan ?? 1}`,
    '--item-ratio': `${item.geometry.width} / ${item.geometry.height}`,
  };

  if (item.kind === 'group') {
    return (
      <div
        className="project-gallery__grid project-gallery__group"
        data-gallery-group={item.id}
        style={{ ...style, ...getGridStyle(item.grid) }}
      >
        {item.children.map((child) => <GalleryItem key={child.id} item={child} />)}
      </div>
    );
  }

  return (
    <div
      className={`project-gallery__card project-gallery__card--${item.tone}${
        item.radius === 'thumbnail' ? ' project-gallery__card--thumbnail' : ''
      }${
        item.kind === 'image' ? ' project-gallery__card--image' : ''
      }`}
      data-gallery-card={item.id}
      style={style}
      aria-hidden={item.kind === 'placeholder' ? true : undefined}
    >
      {item.kind === 'image' && (
        <img
          className="project-gallery__image"
          src={`${import.meta.env.BASE_URL}${item.image.src}`}
          alt={item.image.alt}
          width={item.image.width}
          height={item.image.height}
          loading="lazy"
          decoding="async"
        />
      )}
    </div>
  );
}

function ProjectGallery({ gallery }: { readonly gallery: ProjectGalleryData }) {
  return (
    <section
      className="project-gallery"
      id={gallery.id}
      aria-labelledby={gallery.labelledBy}
      data-gallery-variant={gallery.variant}
    >
      <div
        className={`project-gallery__grid project-gallery__layout${
          gallery.footer ? ' project-gallery__layout--with-footer' : ''
        }`}
        style={getGridStyle(gallery.grid)}
      >
        {gallery.children.map((item) => <GalleryItem key={item.id} item={item} />)}
        {gallery.footer && (
          <footer className="project-gallery__footer">
            <p>{gallery.footer.author}</p>
            <p>{gallery.footer.project}</p>
          </footer>
        )}
      </div>
    </section>
  );
}

export default ProjectGallery;
