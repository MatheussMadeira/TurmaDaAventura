'use client';

import { useId, useRef } from 'react';
import { useInView } from '@/motion/useInView';
import { Backdrop, Svg, type CamoTone } from './CamoPattern.styles';

export type { CamoTone };

export interface CamoPatternProps {
  /** full = camuflagem cheia · soft = fundo de placeholder · forest = sobre surface-forest */
  tone?: CamoTone;
  /** prefixo do <pattern>; um sufixo único (useId) é sempre acrescentado */
  id?: string;
  scale?: number;
  className?: string;
}

const BLOBS: [string, string][] = [
  ['camo-1', 'M-10 20 C 20 -5, 70 5, 85 30 S 60 80, 25 70 S -25 45, -10 20z'],
  ['camo-2', 'M95 -10 C 130 -5, 160 20, 150 45 S 110 60, 95 40 S 70 -15, 95 -10z'],
  ['camo-3', 'M120 70 C 150 60, 190 75, 185 105 S 150 140, 125 125 S 95 80, 120 70z'],
  ['camo-4', 'M20 95 C 45 80, 90 95, 95 120 S 70 160, 40 150 S -5 110, 20 95z'],
  ['camo-2', 'M160 140 C 185 130, 215 150, 205 175 S 170 200, 155 185 S 140 150, 160 140z'],
  ['camo-1', 'M60 165 C 85 155, 120 165, 118 185 S 90 215, 65 205 S 40 175, 60 165z'],
  ['camo-3', 'M-15 175 C 5 165, 30 180, 25 200 S -5 220, -20 210z'],
  ['camo-4', 'M175 0 C 195 -10, 215 5, 210 25 S 185 40, 175 25 S 160 8, 175 0z'],
];
const OFFSETS = [-200, 0, 200];

export function CamoPattern({ tone = 'full', id, scale = 1, className }: CamoPatternProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const pid = `tda-camo-${id ?? tone}-${uid}`;
  const gid = `${pid}-g`;
  return (
    <Svg
      $tone={tone}
      className={className}
      aria-hidden
      width="100%"
      height="100%"
      preserveAspectRatio="none"
    >
      <defs>
        <pattern
          id={pid}
          width={200}
          height={200}
          patternUnits="userSpaceOnUse"
          patternTransform={`scale(${scale})`}
        >
          <rect width={200} height={200} className="ground" />
          {/* As manchas vazam pelas bordas do tile; as 8 cópias vizinhas fecham a emenda.
              Desenhamos o conjunto uma vez e reaproveitamos com <use> (8 + 8 nós, não 72). */}
          <g id={gid}>
            {BLOBS.map(([cls, d], i) => (
              <path key={i} d={d} className={cls} />
            ))}
          </g>
          {OFFSETS.flatMap((dx) =>
            OFFSETS.filter((dy) => dx !== 0 || dy !== 0).map((dy) => (
              <use key={`${dx}_${dy}`} href={`#${gid}`} transform={`translate(${dx} ${dy})`} />
            )),
          )}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${pid})`} />
    </Svg>
  );
}

/** Camuflagem viva em tela cheia do pai (CTABanner, Hero floresta). Pausa quando sai da viewport. */
export function CamoBackdrop({ tone = 'forest', id }: Pick<CamoPatternProps, 'tone' | 'id'>) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { amount: 0.01, once: false });
  return (
    <Backdrop ref={ref} $paused={!visible} aria-hidden>
      <CamoPattern tone={tone} id={id} />
    </Backdrop>
  );
}
