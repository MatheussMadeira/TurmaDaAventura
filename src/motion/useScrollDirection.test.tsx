import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useScrollDirection } from './useScrollDirection';

const scrollTo = (y: number) => {
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true });
  act(() => {
    window.dispatchEvent(new Event('scroll'));
  });
};

describe('useScrollDirection', () => {
  it('marca scrolled após 8px, esconde descendo além de 240px e volta ao subir', async () => {
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
    const { result } = renderHook(() => useScrollDirection());
    expect(result.current).toEqual({ scrolled: false, hidden: false });

    scrollTo(20);
    await waitFor(() => expect(result.current.scrolled).toBe(true));
    expect(result.current.hidden).toBe(false);

    scrollTo(400);
    await waitFor(() => expect(result.current.hidden).toBe(true));

    scrollTo(300);
    await waitFor(() => expect(result.current.hidden).toBe(false));
  });

  it('não faz nada quando desabilitado', () => {
    Object.defineProperty(window, 'scrollY', { value: 500, configurable: true });
    const { result } = renderHook(() => useScrollDirection(true));
    expect(result.current).toEqual({ scrolled: false, hidden: false });
  });
});
