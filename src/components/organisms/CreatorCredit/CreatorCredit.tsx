'use client';

/**
 * CreatorCredit — assinatura de quem criou o site, na última faixa do rodapé.
 * Gatilho “Trilha aberta por …” (pegadas acendem no hover/foco) → “Ficha do guia”
 * (<dialog> nativo: Esc e clique fora fecham, o foco volta ao gatilho).
 * Referência visual: _handoff/turma-da-aventura-creator-credit/CreditoCriador.dc.html
 */
import { useId, useRef, useState } from 'react';
import { trackCreatorCredit } from '@/lib/analytics';
import { Button } from '../../atoms/Button';
import { CamoBackdrop } from '../../atoms/CamoPattern';
import { Icon } from '../../atoms/Icon';
import * as S from './CreatorCredit.styles';

const LINKEDIN_URL = 'https://www.linkedin.com/in/matheus-madeira22/';
const GITHUB_URL = 'https://github.com/MatheussMadeira';
const WHATSAPP_URL = `https://wa.me/5531996193940?text=${encodeURIComponent(
  'Olá, Matheus! Vi o site da Turma da Aventura e queria conversar.',
)}`;

export interface CreatorCreditProps {
  name?: string;
  initials?: string;
  role?: string;
  year?: number;
}

export function CreatorCredit({
  name = 'Matheus Madeira',
  initials = 'MM',
  role = 'Design e desenvolvimento',
  year = 2026,
}: CreatorCreditProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const ringId = `tda-credit-ring-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  const show = () => {
    const d = dialogRef.current;
    if (!d || d.open) return;
    d.showModal();
    setOpen(true);
    trackCreatorCredit('creator_credit_open');
  };
  const close = () => dialogRef.current?.close();

  return (
    <S.Strip>
      <S.Inner>
        <S.Trigger
          ref={triggerRef}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={show}
        >
          <S.Steps aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </S.Steps>
          <span>
            Trilha aberta por <strong>{name}</strong>
          </span>
        </S.Trigger>
      </S.Inner>

      <S.Dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClose={() => {
          setOpen(false);
          triggerRef.current?.focus();
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <S.Card>
          <S.Band>
            <CamoBackdrop tone="forest" id="credit" />
            <S.Kicker className="overline">Ficha do guia</S.Kicker>
            <S.Symbol src="/brand/simbolo-pegadas-branco.svg" alt="" aria-hidden="true" />
            <S.Close type="button" aria-label="Fechar" onClick={close}>
              <Icon name="close" size={22} />
            </S.Close>
          </S.Band>

          <S.Body>
            <S.Head>
              <S.Seal aria-hidden="true">
                <svg viewBox="0 0 112 112">
                  <defs>
                    <path id={ringId} d="M56 56 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0" />
                  </defs>
                  <text>
                    <textPath href={`#${ringId}`}>
                      {`GUIA DA TRILHA · TURMA DA AVENTURA · ${year} ·`}
                    </textPath>
                  </text>
                </svg>
                <span>{initials}</span>
              </S.Seal>
              <div>
                <S.Name id={titleId}>{name}</S.Name>
                <S.Role>{role}</S.Role>
              </div>
            </S.Head>

            <S.Text>
              Desenhei e construí este site, do primeiro rascunho do mapa ao último carimbo. Se você
              gostou da trilha, vamos conversar.
            </S.Text>

            <S.Trail aria-label="Etapas do projeto">
              <li>
                <S.Dot>
                  <Icon name="compass" size={16} />
                </S.Dot>
                <span>
                  Mapa<small>Identidade e design</small>
                </span>
              </li>
              <li>
                <S.Dot>
                  <Icon name="backpack" size={16} />
                </S.Dot>
                <span>
                  Trilha<small>Desenvolvimento</small>
                </span>
              </li>
              <li>
                <S.Dot>
                  <Icon name="tent" size={16} />
                </S.Dot>
                <span>
                  Acampamento<small>Site no ar</small>
                </span>
              </li>
            </S.Trail>

            <S.Links>
              <Button
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                iconLeft="whatsapp"
                onClick={() => trackCreatorCredit('creator_credit_click', { network: 'whatsapp' })}
              >
                Chamar no WhatsApp
              </Button>
              <Button
                variant="outline"
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                iconLeft="linkedin"
                onClick={() => trackCreatorCredit('creator_credit_click', { network: 'linkedin' })}
              >
                Ver LinkedIn
              </Button>
              <Button
                variant="outline"
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                iconLeft="github"
                onClick={() => trackCreatorCredit('creator_credit_click', { network: 'github' })}
              >
                Ver GitHub
              </Button>
            </S.Links>

            <S.Foot>
              <span>Expedição concluída em {year}</span>
              <span>Abre em nova aba</span>
            </S.Foot>
          </S.Body>
        </S.Card>
      </S.Dialog>
    </S.Strip>
  );
}
