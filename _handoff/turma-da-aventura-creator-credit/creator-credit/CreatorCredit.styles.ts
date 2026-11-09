import styled, { css, keyframes } from 'styled-components';

/* Só tokens do design system (CSS custom properties geradas do tokens.json). */

const fade = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const cardIn = keyframes`from { opacity: 0; transform: translateY(var(--move-md)) scale(.96) rotate(-1.5deg); } to { opacity: 1; transform: none; }`;
const stamp = keyframes`from { opacity: 0; transform: scale(.6) rotate(-20deg); } to { opacity: 1; transform: none; }`;
const spin = keyframes`to { transform: rotate(360deg); }`;
const draw = keyframes`from { transform: scaleX(0); } to { transform: scaleX(1); }`;
const step = keyframes`0% { opacity: .35; } 40%, 100% { opacity: 1; }`;
const drift = keyframes`from { transform: translate(0, 0); } to { transform: translate(-20px, 12px); }`;

const reduced = (rules: ReturnType<typeof css>) => css`@media (prefers-reduced-motion: reduce) { ${rules} }`;

export const Strip = styled.div`
  background: var(--surface-forest);
  border-top: 1px dashed color-mix(in srgb, var(--caqui-200) 25%, transparent);
`;
export const Inner = styled.div`
  max-width: var(--container); margin: 0 auto; padding: var(--space-3) var(--space-5);
  display: flex; justify-content: center;
`;

export const Steps = styled.span`
  display: inline-flex; gap: 3px; color: var(--caqui-200);
  i { display: block; width: 5px; height: 8px; border-radius: 3px; background: currentColor; opacity: .35; }
  i:nth-child(odd) { transform: translateY(-2px); }
`;

export const Trigger = styled.button`
  display: inline-flex; align-items: center; gap: var(--space-2);
  min-height: var(--tap-min); padding: 0 var(--space-3);
  border: 0; border-radius: var(--radius-pill); background: transparent; cursor: pointer;
  color: var(--ink-on-forest-muted); font: 600 14px/20px var(--font-body);
  transition: background-color var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard);
  strong { color: var(--ink-on-forest); font-weight: 800; text-decoration: underline dashed var(--caqui-200); text-underline-offset: 4px; }
  &:hover { background: color-mix(in srgb, var(--ink-on-forest) 6%, transparent); color: var(--ink-on-forest); }
  &:focus-visible { outline: 3px solid var(--focus-on-forest); outline-offset: 2px; }
  &:hover ${Steps} i, &:focus-visible ${Steps} i { animation: ${step} 900ms var(--ease-standard) both; }
  &:hover ${Steps} i:nth-child(2), &:focus-visible ${Steps} i:nth-child(2) { animation-delay: 120ms; }
  &:hover ${Steps} i:nth-child(3), &:focus-visible ${Steps} i:nth-child(3) { animation-delay: 240ms; }
  &:hover ${Steps} i:nth-child(4), &:focus-visible ${Steps} i:nth-child(4) { animation-delay: 360ms; }
  ${reduced(css`&:hover ${Steps} i { animation: none; opacity: 1; }`)}
`;

export const Dialog = styled.dialog`
  padding: 0; border: 0; background: transparent; max-width: 560px; width: calc(100% - 2 * var(--space-5));
  &::backdrop { background: var(--scrim); animation: ${fade} var(--dur-medium) var(--ease-enter) both; }
  &[open] > * { animation: ${cardIn} var(--dur-slow) var(--ease-stamp) both; }
  @media (max-width: 599px) {
    width: 100%; max-width: none; margin: auto 0 0;
  }
  ${reduced(css`&[open] > *, &::backdrop { animation: ${fade} 150ms linear both; }`)}
`;

export const Card = styled.section`
  position: relative; overflow: hidden; border-radius: var(--radius-lg);
  background: var(--surface-raised); color: var(--ink); font-family: var(--font-body);
  box-shadow: var(--shadow-md), var(--shadow-stamp-card);
  @media (max-width: 599px) { border-radius: var(--radius-lg) var(--radius-lg) 0 0; }
`;

export const Band = styled.div`
  position: relative; height: 112px; overflow: hidden; background: var(--surface-forest);
`;
/* Envolve o átomo CamoPattern tone="forest" com a mesma deriva lenta da faixa de CTA. */
export const Camo = styled.div`
  position: absolute; inset: -24px;
  svg { width: 100%; height: 100%; }
  animation: ${drift} var(--dur-ambient) var(--ease-standard) infinite alternate;
  ${reduced(css`animation: none;`)}
`;
export const Kicker = styled.p`
  position: absolute; left: var(--space-6); top: var(--space-5); margin: 0; color: var(--caqui-200);
`;
export const Symbol = styled.img`
  position: absolute; right: var(--space-8); top: 22px; width: 76px; transform: rotate(-12deg);
`;
export const Close = styled.button`
  position: absolute; top: var(--space-3); right: var(--space-3); z-index: 2;
  display: grid; place-items: center; width: var(--tap-min); height: var(--tap-min);
  border: 0; border-radius: var(--radius-sm); cursor: pointer;
  background: color-mix(in srgb, var(--ink-on-forest) 10%, transparent); color: var(--ink-on-forest);
  &:focus-visible { outline: 3px solid var(--focus-on-forest); outline-offset: 2px; }
`;

export const Body = styled.div`
  padding: 0 var(--space-6) var(--space-6); display: flex; flex-direction: column; gap: var(--space-4);
  @media (max-width: 599px) { padding: 0 var(--space-5) var(--space-5); }
`;
export const Head = styled.div`display: flex; align-items: flex-end; gap: var(--space-4); flex-wrap: wrap;`;

export const Seal = styled.div`
  position: relative; width: 112px; height: 112px; margin-top: -56px; border-radius: 50%;
  background: var(--surface-raised); box-shadow: 0 0 0 6px var(--surface-raised), var(--shadow-md);
  display: grid; place-items: center;
  animation: ${stamp} var(--dur-slow) var(--ease-stamp) 160ms both;
  svg { position: absolute; inset: 0; width: 100%; height: 100%; animation: ${spin} 24s linear infinite; }
  text { font: 800 9.5px var(--font-body); letter-spacing: 2.6px; fill: var(--earth-strong); }
  span {
    display: grid; place-items: center; width: 62px; height: 62px; border-radius: 50%;
    background: var(--brand); color: var(--on-brand);
    font: 800 24px/1 var(--font-display); font-variation-settings: 'opsz' 36, 'SOFT' 100;
  }
  ${reduced(css`animation: ${fade} 150ms linear both; svg { animation: none; }`)}
`;
export const Name = styled.h2`
  margin: 0; font: 700 28px/34px var(--font-display); font-variation-settings: 'opsz' 36, 'SOFT' 100;
  @media (max-width: 599px) { font-size: 24px; line-height: 30px; }
`;
export const Role = styled.p`
  margin: 2px 0 0; font: 800 13px/16px var(--font-body); letter-spacing: .14em; text-transform: uppercase; color: var(--earth-strong);
`;
export const Text = styled.p`margin: 0; color: var(--ink-muted); font: 400 16px/25px var(--font-body);`;

export const Dot = styled.span`
  display: grid; place-items: center; width: 30px; height: 30px; flex: none; border-radius: 50%;
  background: var(--surface-raised); border: 2px solid var(--brand); color: var(--brand);
  animation: ${stamp} var(--dur-slow) var(--ease-stamp) both;
  ${reduced(css`animation: ${fade} 150ms linear both;`)}
`;
export const Trail = styled.ol`
  position: relative; list-style: none; margin: 0; padding: var(--space-4);
  border-radius: var(--radius-md); background: var(--surface-sunken);
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-3);
  &::before {
    content: ""; position: absolute; left: 36px; right: 36px; top: 30px;
    border-top: 2px dashed var(--earth); opacity: .6; transform-origin: left;
    animation: ${draw} var(--dur-trail) var(--ease-standard) 300ms both;
  }
  li { position: relative; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; font: 700 13px/17px var(--font-body); }
  li:nth-child(1) ${Dot} { animation-delay: 300ms; }
  li:nth-child(2) ${Dot} { animation-delay: 900ms; }
  li:nth-child(3) ${Dot} { animation-delay: 1500ms; }
  small { display: block; font: 600 12px/16px var(--font-body); color: var(--ink-muted); }
  @media (max-width: 599px) {
    grid-template-columns: 1fr;
    &::before { display: none; }
    li { flex-direction: row; text-align: left; }
  }
  ${reduced(css`&::before { animation: none; }`)}
`;

/* Os dois links reaproveitam o visual do átomo Button (primary e outline). Se o Button aceitar ícone customizado, troque por ele. */
export const Links = styled.div`
  display: flex; gap: var(--space-3); flex-wrap: wrap;
  a {
    flex: 1 1 180px; display: inline-flex; align-items: center; justify-content: center; gap: var(--space-2);
    min-height: var(--tap-min); padding: 0 var(--space-5); margin-bottom: 4px;
    border-radius: var(--radius-md); font: 800 16px/20px var(--font-body); text-decoration: none;
    transition: transform var(--dur-fast) var(--ease-stamp), box-shadow var(--dur-fast) var(--ease-standard), background-color var(--dur-fast) var(--ease-standard);
  }
  a:focus-visible { outline: 3px solid var(--focus); outline-offset: 3px; }
  .btn-primary { background: var(--brand); color: var(--on-brand); box-shadow: var(--shadow-stamp-brand); }
  .btn-primary:hover { background: var(--brand-hover); transform: translateY(-1px); }
  .btn-primary:active { transform: translateY(var(--move-xs)); box-shadow: none; transition-duration: 60ms; }
  .btn-outline { background: transparent; color: var(--brand); border: var(--border-thick) solid var(--brand); }
  .btn-outline:hover { background: var(--brand-soft); }
  ${reduced(css`a { transition: none; } a:hover, a:active { transform: none; }`)}
`;

export const Foot = styled.div`
  display: flex; justify-content: space-between; gap: var(--space-3);
  padding-top: var(--space-3); border-top: 1px dashed var(--line);
  font: 600 13px/18px var(--font-body); color: var(--ink-muted);
`;
