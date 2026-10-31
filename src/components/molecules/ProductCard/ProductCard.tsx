'use client';

import { bagMeta } from '@/lib/bag';
import type { Product } from '@/content/types';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import { Media } from '../../atoms/Media';
import { Stepper } from '../../atoms/Stepper';
import { Tag, TagList } from '../../atoms/Tag';
import { VisuallyHidden } from '../../atoms/VisuallyHidden';
import { useBag } from '../../organisms/Bag/BagContext';
import { Article, Body, Foot, InBag, Overline, Text, Title } from './ProductCard.styles';

export interface ProductCardProps {
  product: Product;
  /** estado forçado para documentação (/_dev) e prévia do painel; padrão = o da sacola */
  qty?: number;
  className?: string;
}

/**
 * Card de produto: foto 4:3, categoria, nome, descrição, etiquetas e "Adicionar à sacola".
 * Na sacola ganha borda brand, "Na sacola" e o Stepper. Sem preço. Esgotado: etiqueta e sem botão.
 */
export function ProductCard({ product: p, qty: forcedQty, className }: ProductCardProps) {
  const bag = useBag();
  const qty = forcedQty ?? bag.qtyOf(p.slug);
  const inBag = qty > 0;

  const add = () =>
    bag.add({
      slug: p.slug,
      name: p.name,
      icon: p.icon,
      meta: bagMeta(p),
      minQty: p.minQty,
      image: p.image?.src ?? null,
    });

  return (
    <Article data-in-bag={inBag} aria-label={p.name} className={className}>
      <Media
        src={p.image?.src}
        alt={p.image?.alt ?? p.imageAlt}
        icon={p.icon}
        ratio="4 / 3"
        placeholderId={`prod-${p.slug}`}
        sizes="(min-width: 1200px) 384px, (min-width: 768px) 50vw, 100vw"
      />
      <Body>
        <Overline className="overline">{p.categoryLabel}</Overline>
        <Title className="h4">{p.name}</Title>
        <Text className="body-sm">{p.description}</Text>
        <TagList>
          {p.soldOut ? (
            <Tag tone="neutral" icon="flag">
              Esgotado
            </Tag>
          ) : null}
          {p.minQty > 1 ? (
            <Tag tone="olive" icon="users">
              Mín. {p.minQty} un.
            </Tag>
          ) : null}
          {p.personalizavel ? (
            <Tag tone="brand" icon="star">
              Personalizável
            </Tag>
          ) : null}
          {p.nosRestaurantes ? (
            <Tag tone="earth" icon="utensils">
              Nos restaurantes
            </Tag>
          ) : null}
        </TagList>
        {p.soldOut ? null : (
          <Foot>
            {inBag ? (
              <>
                <InBag>
                  <Icon name="check" size={18} />
                  Na sacola
                </InBag>
                <Stepper
                  label={`Quantidade de ${p.name}`}
                  value={qty}
                  onDecrease={() => bag.setQty(p.slug, qty - 1)}
                  onIncrease={() => bag.setQty(p.slug, qty + 1)}
                />
              </>
            ) : (
              <Button variant="outline" size="sm" iconLeft="backpack" onClick={add}>
                Adicionar à sacola
                <VisuallyHidden>: {p.name}</VisuallyHidden>
              </Button>
            )}
          </Foot>
        )}
      </Body>
    </Article>
  );
}
