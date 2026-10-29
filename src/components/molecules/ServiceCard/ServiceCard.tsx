'use client';

import { Icon, type IconName } from '../../atoms/Icon';
import { Media } from '../../atoms/Media';
import { Tag, TagList } from '../../atoms/Tag';
import {
  Article,
  Body,
  CardLink,
  IconBadge,
  More,
  Overline,
  Text,
  Title,
} from './ServiceCard.styles';

export interface ServiceCardProps {
  title: string;
  description?: string;
  overline?: string;
  icon?: IconName;
  /** passe uma URL (ou null para o placeholder) para trocar o ícone por foto */
  image?: string | null;
  imageAlt?: string;
  tags?: string[];
  href?: string;
  linkLabel?: string;
  tone?: 'default' | 'earth';
  placeholderId?: string;
  className?: string;
  /** Força um estado visual para documentação (/_dev/componentes). */
  'data-state'?: 'hover' | 'focus' | 'pressed';
}

export function ServiceCard({
  title,
  description,
  overline,
  icon,
  image,
  imageAlt,
  tags,
  href,
  linkLabel,
  tone = 'default',
  placeholderId,
  className,
  'data-state': state,
}: ServiceCardProps) {
  const body = (
    <>
      {image !== undefined ? (
        <Media
          src={image}
          alt={imageAlt}
          icon={icon}
          ratio="16 / 10"
          placeholderId={placeholderId}
        />
      ) : (
        <IconBadge $earth={tone === 'earth'}>
          <Icon name={icon ?? 'compass'} size={28} />
        </IconBadge>
      )}
      <Body>
        {overline ? <Overline className="overline">{overline}</Overline> : null}
        <Title className="h4">{title}</Title>
        {description ? <Text className="body-sm">{description}</Text> : null}
        {tags?.length ? (
          <TagList>
            {tags.map((t) => (
              <Tag key={t} tone="olive">
                {t}
              </Tag>
            ))}
          </TagList>
        ) : null}
        {href ? (
          <More data-card-more>
            {linkLabel ?? 'Saiba mais'}
            <Icon name="arrow-right" size={18} />
          </More>
        ) : null}
      </Body>
    </>
  );

  const flags = { $earth: tone === 'earth', $link: !!href, className, 'data-state': state };
  return href ? (
    <CardLink href={href} {...flags}>
      {body}
    </CardLink>
  ) : (
    <Article {...flags}>{body}</Article>
  );
}
