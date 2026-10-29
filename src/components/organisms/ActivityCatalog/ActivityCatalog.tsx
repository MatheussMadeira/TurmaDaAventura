'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, LayoutGroup, m } from 'framer-motion';
import styled from 'styled-components';
import { media } from '@/design-system/media';
import { dur, ease } from '@/motion/tokens';
import { Reveal } from '@/motion/Reveal';
import type { IconName } from '../../atoms/Icon';
import { VisuallyHidden } from '../../atoms/VisuallyHidden';
import { FilterChips } from '../../molecules/FilterChips';
import { ServiceCard } from '../../molecules/ServiceCard';

export interface CatalogActivity {
  slug: string;
  categoria: string;
  icon: IconName;
  title: string;
  description: string;
  tags: string[];
  image: string | null;
  imageAlt: string;
}

export interface ActivityCatalogProps {
  categories: string[];
  activities: CatalogActivity[];
}

const ALL = 'Todas';

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
`;

const Cards = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-6);

  ${media.down('bp-lg')} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  ${media.down('bp-md')} {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-5);
  }
`;

const Item = styled(m.div)`
  display: flex;
  flex-direction: column;
  min-width: 0;

  & > * {
    flex: 1 0 auto;
  }
`;

/* Filtro da Oficina: chips com pílula que desliza (layoutId) e cards que entram/saem
   (fade + 0.94 ↔ 1, popLayout) sem pulo de layout. */
export function ActivityCatalog({ categories, activities }: ActivityCatalogProps) {
  const [cat, setCat] = useState(ALL);

  const options = useMemo(
    () => [
      { value: ALL, label: ALL, count: activities.length },
      ...categories.map((c) => ({
        value: c,
        label: c,
        count: activities.filter((a) => a.categoria === c).length,
      })),
    ],
    [categories, activities],
  );

  const visible = activities.filter((a) => cat === ALL || a.categoria === cat);

  return (
    <Stack>
      <FilterChips
        label="Filtrar atividades por categoria"
        options={options}
        value={cat}
        onChange={setCat}
      />
      <VisuallyHidden role="status" aria-live="polite">
        {visible.length === 1 ? 'Mostrando 1 atividade' : `Mostrando ${visible.length} atividades`}
      </VisuallyHidden>
      <Reveal effect="fade">
        <LayoutGroup>
          <Cards>
            <AnimatePresence mode="popLayout" initial={false}>
              {visible.map((a) => (
                <Item
                  key={a.slug}
                  layout
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    transition: { duration: dur.medium, ease: ease.enter },
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.94,
                    transition: { duration: dur.medium, ease: ease.exit },
                  }}
                  transition={{ layout: { duration: dur.medium, ease: ease.enter } }}
                >
                  <ServiceCard
                    image={a.image}
                    imageAlt={a.imageAlt}
                    icon={a.icon}
                    overline={a.categoria}
                    title={a.title}
                    description={a.description}
                    tags={a.tags}
                    placeholderId={`act-${a.slug}`}
                  />
                </Item>
              ))}
            </AnimatePresence>
          </Cards>
        </LayoutGroup>
      </Reveal>
    </Stack>
  );
}
