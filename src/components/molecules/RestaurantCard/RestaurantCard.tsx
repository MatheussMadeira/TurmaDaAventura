'use client';

import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import { Media } from '../../atoms/Media';
import {
  Article,
  Body,
  BrandLogo,
  MediaWrap,
  Meta,
  Overline,
  Title,
} from './RestaurantCard.styles';

export interface RestaurantCardProps {
  name: string;
  neighborhood?: string;
  /** texto livre: "Sáb e dom, 12h às 17h" */
  schedule?: string;
  address?: string;
  ages?: string;
  image?: string;
  imageAlt?: string;
  /** logo do restaurante parceiro (quadrado, fundo transparente) */
  brandLogo?: string;
  mapsUrl?: string;
  placeholderId?: string;
  className?: string;
}

export function RestaurantCard({
  name,
  neighborhood,
  schedule,
  address,
  ages,
  image,
  imageAlt,
  brandLogo,
  mapsUrl,
  placeholderId,
  className,
}: RestaurantCardProps) {
  return (
    <Article className={className}>
      <MediaWrap>
        <Media
          src={image}
          alt={imageAlt ?? name}
          icon="utensils"
          ratio="4 / 3"
          placeholderId={placeholderId}
        />
        {brandLogo ? (
          <BrandLogo src={brandLogo} alt={`Logo ${name}`} width={64} height={64} />
        ) : null}
      </MediaWrap>
      <Body>
        {neighborhood ? <Overline className="overline">{neighborhood}</Overline> : null}
        <Title className="h4">{name}</Title>
        <Meta>
          {schedule ? (
            <li>
              <Icon name="clock" size={18} />
              {schedule}
            </li>
          ) : null}
          {address ? (
            <li>
              <Icon name="map-pin" size={18} />
              {address}
            </li>
          ) : null}
          {ages ? (
            <li>
              <Icon name="users" size={18} />
              {ages}
            </li>
          ) : null}
        </Meta>
        {mapsUrl ? (
          <Button
            variant="outline"
            size="sm"
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            iconRight="arrow-right"
          >
            Como chegar
          </Button>
        ) : null}
      </Body>
    </Article>
  );
}
