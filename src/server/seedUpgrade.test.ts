import { describe, expect, it } from 'vitest';
import { applyChanges, skippedLines } from './seedUpgrade';

const base = {
  title: 'Três jeitos',
  secondary: { label: 'Conhecer a Oficina', href: '/oficina' },
  cards: [{ title: 'A' }],
};

describe('applyChanges — não sobrescreve o que o cliente editou', () => {
  it('troca o campo que ainda tem o texto original', () => {
    const r = applyChanges(base, [
      { path: 'secondary.label', from: 'Conhecer a Oficina', to: 'Conhecer as Oficinas' },
    ]);
    expect(r.value.secondary).toEqual({ label: 'Conhecer as Oficinas', href: '/oficina' });
    expect(r.outcomes).toEqual([{ path: 'secondary.label', outcome: 'updated' }]);
  });

  it('mantém o campo que o cliente já mudou e o aponta como "edited"', () => {
    const edited = { ...base, title: 'Nosso jeito próprio' };
    const r = applyChanges(edited, [{ path: 'title', from: 'Três jeitos', to: 'Quatro jeitos' }]);
    expect(r.value.title).toBe('Nosso jeito próprio');
    expect(r.outcomes[0]!.outcome).toBe('edited');
    expect(skippedLines('inicio/quatro-jeitos', r.outcomes)).toEqual([
      'inicio/quatro-jeitos · title',
    ]);
  });

  it('é idempotente: rodar de novo não muda nada (já atualizado)', () => {
    const c = [{ path: 'title', from: 'Três jeitos', to: 'Quatro jeitos' }];
    const once = applyChanges(base, c);
    const twice = applyChanges(once.value, c);
    expect(twice.value).toEqual(once.value);
    expect(twice.outcomes[0]!.outcome).toBe('already');
  });

  it('compara listas inteiras: só troca se ninguém mexeu em nenhum item', () => {
    const c = [{ path: 'cards', from: [{ title: 'A' }], to: [{ title: 'F' }, { title: 'A' }] }];
    expect(applyChanges(base, c).value.cards).toHaveLength(2);
    const touched = { ...base, cards: [{ title: 'A editado' }] };
    const r = applyChanges(touched, c);
    expect(r.value.cards).toEqual([{ title: 'A editado' }]);
    expect(r.outcomes[0]!.outcome).toBe('edited');
  });

  it('não muta o objeto original', () => {
    const copy = JSON.parse(JSON.stringify(base));
    applyChanges(base, [{ path: 'title', from: 'Três jeitos', to: 'X' }]);
    expect(base).toEqual(copy);
  });

  it('campo ausente é "missing" (não inventa conteúdo)', () => {
    expect(
      applyChanges(base, [{ path: 'nao.existe', from: 'a', to: 'b' }]).outcomes[0]!.outcome,
    ).toBe('missing');
  });
});
