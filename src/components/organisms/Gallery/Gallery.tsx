'use client';

import type { IconName } from '../../atoms/Icon';
import { Media } from '../../atoms/Media';

import { Grid } from './Gallery.styles';

export interface GalleryImage {
  src?: string | null;
  /** descrição obrigatória (acessibilidade); vem do cadastro de fotos */
  alt: string;
  icon?: IconName;
}

export interface GalleryProps {
  /** 6 fotos; a grade irregular (2×2, 1, 1×2, 1, 2×1, 2×1) segue a ordem */
  images: GalleryImage[];
  className?: string;
}

export function Gallery({ images, className }: GalleryProps) {
  return (
    <Grid effect="scale" stagger className={className}>
      {images.map((img, i) => (
        <Media
          key={i}
          src={img.src}
          alt={img.alt}
          icon={img.icon}
          ratio="auto"
          placeholderId={`gal${i}`}
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
      ))}
    </Grid>
  );
}
