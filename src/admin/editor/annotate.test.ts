import { beforeEach, describe, expect, it } from 'vitest';
import { annotateSection } from './annotate';

const content = {
  overline: 'Recreação infantil',
  title: 'Bora pra aventura?',
  lead: 'Texto de abertura.',
  imageId: null,
  imageAlt: 'Foto',
  ctaLabel: '',
  secondary: { label: 'Conhecer a Oficina', href: '/oficina' },
  highlights: ['Monitores treinados', 'Montamos tudo no local'],
};

describe('annotateSection — liga o texto da tela ao campo do schema', () => {
  let root: HTMLElement;
  beforeEach(() => {
    root = document.createElement('div');
    root.innerHTML = `
      <p>Recreação  infantil</p>
      <h1>Bora pra aventura?</h1>
      <p>Texto de abertura.</p>
      <a><span>Conhecer a Oficina</span></a>
      <ul><li>Monitores treinados</li><li>Montamos tudo no local</li></ul>
      <div data-media></div>`;
  });

  it('marca cada texto com o caminho, o tipo e a etiqueta com contador', () => {
    annotateSection(root, 'hero', content);
    const h1 = root.querySelector('h1')!;
    expect(h1.dataset.editPath).toBe('title');
    expect(h1.dataset.editMax).toBe('70');
    expect(h1.dataset.editLabel).toBe('Título · 18/70');
    expect(root.querySelector('p')!.dataset.editPath).toBe('overline'); // espaços extras não atrapalham
    expect(root.querySelector('a span')!.getAttribute('data-edit-path')).toBe('secondary.label');
    const items = [...root.querySelectorAll('li')].map((l) => l.dataset.editPath);
    expect(items).toEqual(['highlights.0', 'highlights.1']);
  });

  it('a moldura de foto vira campo de foto quando o número de molduras bate', () => {
    annotateSection(root, 'hero', content);
    const frame = root.querySelector('[data-media]') as HTMLElement;
    expect(frame.dataset.editPath).toBe('imageId');
    expect(frame.dataset.editKind).toBe('image');
  });

  it('refazer a marcação não duplica nem deixa rastro de texto que mudou', () => {
    annotateSection(root, 'hero', content);
    annotateSection(root, 'hero', { ...content, title: 'Outro título' });
    expect(root.querySelector('h1')!.hasAttribute('data-edit-path')).toBe(false);
    expect(root.querySelectorAll('[data-edit-path]').length).toBe(6);
  });

  it('texto que aparece em dois lugares só liga ao primeiro (o outro segue pelo painel)', () => {
    root.innerHTML = '<h1>Igual</h1><p>Igual</p>';
    annotateSection(root, 'cta', { title: 'Igual', text: 'Igual', ctaLabel: 'Ir' });
    expect(root.querySelectorAll('[data-edit-path]').length).toBe(2);
    expect(root.querySelector('h1')!.dataset.editPath).toBe('title');
    expect(root.querySelector('p')!.dataset.editPath).toBe('text');
  });
});
