'use client';

/**
 * Temas de festa: grade de cards. Cards com "Detalhes" cadastrados no admin ganham o botão
 * "Ver detalhes", que abre um modal (<dialog> nativo: Esc e clique fora fecham, o foco volta ao
 * botão). Card sem detalhes continua sem modal.
 */
import { useEffect, useId, useRef, useState } from 'react';
import type { PartyTheme } from '@/content/types';
import { trackWhatsappClick } from '@/lib/analytics';
import { whatsappUrl } from '@/lib/whatsapp';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import { Media } from '../../atoms/Media';
import { Tag, TagList } from '../../atoms/Tag';
import { ServiceCard } from '../../molecules/ServiceCard';
import { useSiteSettings } from '../../SiteSettings';
import * as S from './ThemeCatalog.styles';

export interface ThemeCatalogProps {
  themes: PartyTheme[];
}

/** Parágrafos separados por linha em branco; linhas vazias e espaços sobrando não entram. */
export const detailParagraphs = (details: string) =>
  details
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

export function ThemeCatalog({ themes }: ThemeCatalogProps) {
  const settings = useSiteSettings();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState<PartyTheme | null>(null);
  const titleId = useId();

  useEffect(() => {
    const d = dialogRef.current;
    if (active && d && !d.open) d.showModal();
  }, [active]);

  const open = (theme: PartyTheme, trigger: HTMLElement) => {
    triggerRef.current = trigger;
    setActive(theme);
  };
  const close = () => dialogRef.current?.close();

  const paragraphs = active ? detailParagraphs(active.details) : [];
  const message = active
    ? `Olá! Quero um orçamento de festa com o tema “${active.title}”.`
    : undefined;

  return (
    <>
      <S.Cards stagger>
        {themes.map((t) => (
          <ServiceCard
            key={t.slug}
            icon={t.icon}
            title={t.title}
            description={t.description}
            tags={t.tags}
            image={t.image?.src ?? null}
            imageAlt={t.image?.alt ?? t.imageAlt}
            placeholderId={`tema-${t.slug}`}
            onAction={t.details.trim() ? (trigger) => open(t, trigger) : undefined}
            actionLabel="Ver detalhes"
          />
        ))}
      </S.Cards>

      <S.Dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClose={() => {
          setActive(null);
          triggerRef.current?.focus();
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        {active ? (
          <S.Card>
            <S.Close type="button" aria-label="Fechar janela" onClick={close}>
              <Icon name="close" size={22} />
            </S.Close>
            <Media
              src={active.image?.src ?? null}
              alt={active.image?.alt ?? active.imageAlt}
              icon={active.icon}
              ratio="16 / 9"
              rounded={false}
              placeholderId={`tema-modal-${active.slug}`}
              sizes="(min-width: 768px) 640px, 100vw"
            />
            <S.Body>
              <S.Overline className="overline">Tema de festa</S.Overline>
              <S.Title id={titleId}>{active.title}</S.Title>
              {active.tags.length ? (
                <TagList>
                  {active.tags.map((tag) => (
                    <Tag key={tag} tone="olive">
                      {tag}
                    </Tag>
                  ))}
                </TagList>
              ) : null}
              <S.Details>
                {paragraphs.map((p, i) => (
                  <p key={i} className="body">
                    {p}
                  </p>
                ))}
              </S.Details>
              <S.Actions>
                <Button
                  href={whatsappUrl(message, settings.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  iconLeft="whatsapp"
                  onClick={() =>
                    trackWhatsappClick({ page: '/festas-e-aniversarios', placement: 'cta' })
                  }
                >
                  Pedir orçamento deste tema
                </Button>
                <Button variant="ghost" onClick={close}>
                  Fechar
                </Button>
              </S.Actions>
            </S.Body>
          </S.Card>
        ) : null}
      </S.Dialog>
    </>
  );
}
