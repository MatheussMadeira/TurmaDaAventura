import { describe, expect, it } from 'vitest';
import { timeAgo } from './time';

const NOW = new Date('2026-10-29T12:00:00Z');
const ago = (ms: number) => new Date(NOW.getTime() - ms);

describe('timeAgo', () => {
  it.each([
    [10_000, 'Agora'],
    [5 * 60_000, 'Há 5 min'],
    [3 * 3_600_000, 'Há 3 h'],
    [30 * 3_600_000, 'Ontem'],
    [2 * 86_400_000, 'Há 2 dias'],
  ])('%i ms → %s', (ms, text) => {
    expect(timeAgo(ago(ms), NOW)).toBe(text);
  });

  it('acima de 30 dias mostra a data', () => {
    expect(timeAgo(ago(40 * 86_400_000), NOW)).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });
});
