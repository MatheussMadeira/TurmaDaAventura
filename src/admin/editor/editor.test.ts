import { describe, expect, it } from 'vitest';
import { cropRect, isSmallPhoto, panCenter, parseRatio, viewStyle } from './crop';
import { canRedo, canUndo, initHistory, push, redo, undo } from './history';

describe('recorte com proporção fixa', () => {
  it('interpreta a proporção do schema', () => {
    expect(parseRatio('5 / 4')).toBe(1.25);
    expect(parseRatio('4 / 5')).toBe(0.8);
  });

  it('sem zoom, pega a maior área da proporção e centraliza', () => {
    const r = cropRect(2000, 1000, 1.25, 1, 0.5, 0.5); // foto larga: limita pela altura
    expect(r.h).toBe(1000);
    expect(r.w).toBe(1250);
    expect(r.x).toBe(375);
    expect(r.y).toBe(0);
    const tall = cropRect(1000, 2000, 1.25, 1, 0.5, 0.5); // foto alta: limita pela largura
    expect(tall.w).toBe(1000);
    expect(tall.h).toBe(800);
  });

  it('o zoom reduz a área mantendo a proporção; o recorte nunca sai da foto', () => {
    const r = cropRect(2000, 1000, 1.25, 2, 0, 0); // canto: forçado para dentro
    expect(r.w / r.h).toBeCloseTo(1.25);
    expect(r.w).toBe(625);
    expect(r.x).toBe(0);
    expect(r.y).toBe(0);
    const far = cropRect(2000, 1000, 1.25, 2, 1, 1);
    expect(far.x + far.w).toBeLessThanOrEqual(2000);
    expect(far.y + far.h).toBeLessThanOrEqual(1000);
  });

  it('arrastar para a direita mostra a parte da esquerda da foto', () => {
    const r = cropRect(2000, 1000, 1.25, 2, 0.5, 0.5);
    const c = panCenter(r, 2000, 1000, 500, 100, 0);
    expect(c.cx).toBeLessThan(0.5);
  });

  it('o estilo em % posiciona a foto no visor sem medir a tela', () => {
    const r = cropRect(2000, 1000, 1.25, 1, 0.5, 0.5);
    const s = viewStyle(r, 2000, 1000);
    expect(parseFloat(s.width)).toBeCloseTo(160); // foto 160% da largura do visor
    expect(parseFloat(s.left)).toBeCloseTo(-30);
  });

  it('avisa (sem bloquear) quando a foto é pequena', () => {
    expect(isSmallPhoto({ x: 0, y: 0, w: 600, h: 480 })).toBe(true);
    expect(isSmallPhoto({ x: 0, y: 0, w: 1600, h: 1280 })).toBe(false);
  });
});

describe('desfazer / refazer', () => {
  it('desfaz e refaz na ordem; uma nova edição limpa o "refazer"', () => {
    let h = initHistory('a');
    h = push(h, 'b');
    h = push(h, 'c');
    expect(canUndo(h)).toBe(true);
    h = undo(h);
    expect(h.present).toBe('b');
    h = undo(h);
    expect(h.present).toBe('a');
    expect(canUndo(h)).toBe(false);
    h = redo(h);
    expect(h.present).toBe('b');
    h = push(h, 'x');
    expect(canRedo(h)).toBe(false);
  });

  it('digitar seguido no mesmo campo vira um só passo', () => {
    let h = initHistory('');
    h = push(h, 'o', 'hero.title', 1000);
    h = push(h, 'ol', 'hero.title', 1300);
    h = push(h, 'olá', 'hero.title', 1500);
    expect(h.past).toEqual(['']);
    expect(undo(h).present).toBe('');
  });

  it('campos diferentes, ou uma pausa longa, são passos separados', () => {
    let h = initHistory('');
    h = push(h, 'a', 'x', 1000);
    h = push(h, 'ab', 'y', 1100);
    h = push(h, 'abc', 'y', 5000);
    expect(h.past.length).toBe(3);
  });

  it('não registra passo quando nada mudou', () => {
    const h = initHistory({ a: 1 });
    expect(push(h, h.present)).toBe(h);
  });
});
