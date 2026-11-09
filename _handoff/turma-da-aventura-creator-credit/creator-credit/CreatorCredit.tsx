'use client';

/**
 * CreatorCredit — assinatura de quem criou o site, na última linha do Footer.
 * Gatilho “Trilha aberta por …” (pegadas acendem no hover) → abre a “Ficha do guia”
 * (<dialog> nativo: Esc fecha, foco preso, foco volta ao gatilho).
 * Referência visual: _handoff/canvas/CreditoCriador.dc.html
 */
import { useEffect, useId, useRef, useState } from 'react';
import { Icon } from '@/components/atoms/Icon';
import { CamoPattern } from '@/components/atoms/CamoPattern';
import * as S from './CreatorCredit.styles';

export interface CreatorCreditProps {
  name?: string;
  initials?: string;
  role?: string;
  linkedinUrl: string;
  githubUrl: string;
  year?: number;
}

export function CreatorCredit({
  name = 'Matheus Madeira',
  initials = 'MM',
  role = 'Design e desenvolvimento',
  linkedinUrl,
  githubUrl,
  year = 2026,
}: CreatorCreditProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const ringId = useId().replace(/:/g, '');

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <S.Strip>
      <S.Inner>
        <S.Trigger type="button" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>
          <S.Steps aria-hidden="true"><i /><i /><i /><i /></S.Steps>
          Trilha aberta por <strong>{name}</strong>
        </S.Trigger>
      </S.Inner>

      <S.Dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClose={() => setOpen(false)}
        onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
      >
        <S.Card>
          <S.Band>
            <S.Camo aria-hidden="true"><CamoPattern tone="forest" id="credit" /></S.Camo>
            <S.Kicker className="overline">Ficha do guia</S.Kicker>
            <S.Symbol src="/brand/simbolo-pegadas-branco.svg" alt="" aria-hidden="true" />
            <S.Close type="button" aria-label="Fechar" onClick={() => setOpen(false)}>
              <Icon name="close" size={22} />
            </S.Close>
          </S.Band>

          <S.Body>
            <S.Head>
              <S.Seal aria-hidden="true">
                <svg viewBox="0 0 112 112">
                  <defs><path id={ringId} d="M56 56 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0" /></defs>
                  <text><textPath href={`#${ringId}`}>{`GUIA DA TRILHA · TURMA DA AVENTURA · ${year} ·`}</textPath></text>
                </svg>
                <span>{initials}</span>
              </S.Seal>
              <div>
                <S.Name id={titleId}>{name}</S.Name>
                <S.Role>{role}</S.Role>
              </div>
            </S.Head>

            <S.Text>
              Desenhei e construí este site, do primeiro rascunho do mapa ao último carimbo. Se você gostou da trilha, vamos conversar.
            </S.Text>

            <S.Trail aria-label="Etapas do projeto">
              <li><S.Dot><Icon name="compass" size={16} /></S.Dot><span>Mapa<small>Identidade e design</small></span></li>
              <li><S.Dot><Icon name="backpack" size={16} /></S.Dot><span>Trilha<small>Desenvolvimento</small></span></li>
              <li><S.Dot><Icon name="tent" size={16} /></S.Dot><span>Acampamento<small>Site no ar</small></span></li>
            </S.Trail>

            <S.Links>
              <a className="btn-primary" href={linkedinUrl} target="_blank" rel="noopener noreferrer">
                <LinkedinGlyph /> <span>Ver LinkedIn</span>
              </a>
              <a className="btn-outline" href={githubUrl} target="_blank" rel="noopener noreferrer">
                <GithubGlyph /> <span>Ver GitHub</span>
              </a>
            </S.Links>

            <S.Foot><span>Expedição concluída em {year}</span><span>Abre em nova aba</span></S.Foot>
          </S.Body>
        </S.Card>
      </S.Dialog>
    </S.Strip>
  );
}

/* Glifos em traço 2px no mesmo padrão do Icon (baseados no Feather, MIT) */
function LinkedinGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}
function GithubGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}
