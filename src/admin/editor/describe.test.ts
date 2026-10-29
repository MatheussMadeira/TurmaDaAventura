import { describe as suite, expect, it } from 'vitest';
import { sectionSchemas } from '@/content/sections/schemas';
import { DEFAULT_PAGES } from '@/content/defaults/pages';
import { describe, getAt, mediaSlots, setAt, textLeaves, type FieldNode } from './describe';

const walk = (n: FieldNode, fn: (n: FieldNode) => void) => {
  fn(n);
  if (n.kind === 'group') n.fields.forEach((f) => walk(f.node, fn));
  if (n.kind === 'list') walk(n.item, fn);
};

suite('describe — painel gerado do schema', () => {
  it('todo campo de todo tipo de seção tem rótulo legível', () => {
    for (const [type, schema] of Object.entries(sectionSchemas)) {
      walk(describe(schema), (n) => {
        if (n.kind === 'group') return;
        expect(n.label, `${type}`).toBeTruthy();
        expect(n.label, `${type}`).not.toMatch(/^[a-z]+$/); // nada de "tone"/"title" crus
      });
    }
  });

  it('textos trazem limite, multilinha e obrigatoriedade', () => {
    const hero = describe(sectionSchemas.hero) as Extract<FieldNode, { kind: 'group' }>;
    const title = hero.fields.find((f) => f.key === 'title')!.node;
    const lead = hero.fields.find((f) => f.key === 'lead')!.node;
    const overline = hero.fields.find((f) => f.key === 'overline')!.node;
    expect(title).toMatchObject({ kind: 'text', max: 70, required: true });
    expect(lead).toMatchObject({ multiline: true, max: 320 });
    expect(overline).toMatchObject({ required: false });
  });

  it('listas trazem mínimo e máximo; fotos trazem a proporção do slot', () => {
    const cards = describe(sectionSchemas.cards) as Extract<FieldNode, { kind: 'group' }>;
    expect(cards.fields.find((f) => f.key === 'cards')!.node).toMatchObject({
      kind: 'list',
      min: 2,
      max: 4,
    });
    const hero = describe(sectionSchemas.hero) as Extract<FieldNode, { kind: 'group' }>;
    expect(hero.fields.find((f) => f.key === 'imageId')!.node).toMatchObject({
      kind: 'media',
      ratio: '5 / 4',
    });
    const owner = describe(sectionSchemas['owner-panel']) as Extract<FieldNode, { kind: 'group' }>;
    expect(owner.fields.find((f) => f.key === 'imageId')!.node).toMatchObject({ ratio: '4 / 5' });
  });

  it('getAt/setAt são imutáveis e funcionam em listas', () => {
    const o = { cards: [{ title: 'a' }, { title: 'b' }] };
    const n = setAt(o, 'cards.1.title', 'x');
    expect(getAt(n, 'cards.1.title')).toBe('x');
    expect(o.cards[1]!.title).toBe('b');
    expect(n.cards[0]).toBe(o.cards[0]);
  });

  it('o texto padrão do Início expõe folhas editáveis e o slot de foto do hero', () => {
    const hero = DEFAULT_PAGES.inicio!.hero!;
    const node = describe(sectionSchemas.hero);
    const leaves = textLeaves(node, hero.content);
    expect(leaves.map(([p]) => p)).toContain('title');
    expect(leaves.map(([p]) => p)).toContain('highlights.0');
    expect(mediaSlots(node, hero.content).map(([p]) => p)).toEqual(['imageId']);
  });
});
