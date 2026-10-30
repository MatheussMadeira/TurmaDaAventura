'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, LayoutGroup, m } from 'framer-motion';
import styled from 'styled-components';
import { media } from '@/design-system/media';
import type { Product } from '@/content/types';
import { LayoutMotion } from '@/motion/LayoutMotion';
import { dur, ease } from '@/motion/tokens';
import { Reveal } from '@/motion/Reveal';
import { VisuallyHidden } from '../../atoms/VisuallyHidden';
import { FilterChips } from '../../molecules/FilterChips';
import { ProductCard } from '../../molecules/ProductCard';

export interface ProductCatalogProps {
  products: Product[];
}

const ALL = 'Todos';

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

/* Filtro por categoria como nas Oficinas: pílula que desliza (layoutId) e cards que entram/saem
   (fade + 0.94 ↔ 1, popLayout) sem pulo de layout. */
export function ProductCatalog({ products }: ProductCatalogProps) {
  const [cat, setCat] = useState(ALL);

  const options = useMemo(() => {
    const labels = [...new Set(products.map((p) => p.categoryLabel))];
    return [
      { value: ALL, label: ALL, count: products.length },
      ...labels.map((c) => ({
        value: c,
        label: c,
        count: products.filter((p) => p.categoryLabel === c).length,
      })),
    ];
  }, [products]);

  const visible = products.filter((p) => cat === ALL || p.categoryLabel === cat);

  if (!products.length) {
    return (
      <p className="body" style={{ margin: 0, color: 'var(--ink-muted)' }}>
        Em breve, novos produtos por aqui.
      </p>
    );
  }

  return (
    <LayoutMotion>
      <Stack>
        <FilterChips
          label="Filtrar produtos por categoria"
          options={options}
          value={cat}
          onChange={setCat}
        />
        <VisuallyHidden role="status" aria-live="polite">
          {visible.length === 1 ? 'Mostrando 1 produto' : `Mostrando ${visible.length} produtos`}
        </VisuallyHidden>
        <Reveal effect="fade">
          <LayoutGroup>
            <Cards>
              <AnimatePresence mode="popLayout" initial={false}>
                {visible.map((p) => (
                  <Item
                    key={p.slug}
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
                    <ProductCard product={p} />
                  </Item>
                ))}
              </AnimatePresence>
            </Cards>
          </LayoutGroup>
        </Reveal>
      </Stack>
    </LayoutMotion>
  );
}
