'use client';

import { Tag, TagList } from '../../atoms/Tag';
import { Article, Bio, Initials, Nick, Photo, PhotoImg, Role, Title } from './TeamCard.styles';

export interface TeamCardProps {
  name: string;
  /** apelido de monitor: "Capitão Trilha" */
  nickname?: string;
  role?: string;
  bio?: string;
  photo?: string;
  /** certificações: "Primeiros socorros" */
  badges?: string[];
  className?: string;
}

const initialsOf = (name: string) =>
  (name || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('');

export function TeamCard({ name, nickname, role, bio, photo, badges, className }: TeamCardProps) {
  return (
    <Article className={className}>
      <Photo>
        {photo ? (
          <PhotoImg src={photo} alt={name} fill sizes="128px" />
        ) : (
          <Initials aria-hidden>{initialsOf(name)}</Initials>
        )}
      </Photo>
      {nickname ? <Nick className="tagline">{nickname}</Nick> : null}
      <Title className="h4">{name}</Title>
      {role ? <Role className="caption">{role}</Role> : null}
      {bio ? <Bio className="body-sm">{bio}</Bio> : null}
      {badges?.length ? (
        <TagList $center>
          {badges.map((b) => (
            <Tag key={b} tone="earth" icon="shield">
              {b}
            </Tag>
          ))}
        </TagList>
      ) : null}
    </Article>
  );
}
