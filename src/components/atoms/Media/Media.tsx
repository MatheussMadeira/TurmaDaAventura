'use client';

import Image from 'next/image';
import { CamoPattern } from '../CamoPattern';
import { Icon, type AnyIconName } from '../Icon';
import { Badge, Caption, Frame, Placeholder } from './Media.styles';

export interface MediaProps {
  src?: string | null;
  alt?: string;
  /** CSS aspect-ratio; padrão '4 / 3' */
  ratio?: string;
  /** Ícone mostrado no placeholder de camuflagem quando não há foto */
  icon?: AnyIconName;
  caption?: string;
  rounded?: boolean;
  /** prefixo do pattern SVG do placeholder (um sufixo único é acrescentado) */
  placeholderId?: string;
  /** foto acima da dobra (LCP): desliga o lazy-loading */
  priority?: boolean;
  /** atributo `sizes` do next/image; padrão = largura do container até 1200px */
  sizes?: string;
  className?: string;
}

export function Media({
  src,
  alt = '',
  ratio = '4 / 3',
  icon = 'tent',
  caption,
  rounded = true,
  placeholderId,
  priority = false,
  sizes = '(min-width: 1200px) 600px, 100vw',
  className,
}: MediaProps) {
  return (
    <Frame data-media $ratio={ratio} $rounded={rounded} className={className}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} />
      ) : (
        <Placeholder
          data-media-placeholder
          role={alt ? 'img' : undefined}
          aria-label={alt || undefined}
        >
          <CamoPattern tone="soft" id={placeholderId} />
          <Badge>
            <Icon name={icon} size={28} />
          </Badge>
        </Placeholder>
      )}
      {caption ? <Caption>{caption}</Caption> : null}
    </Frame>
  );
}
