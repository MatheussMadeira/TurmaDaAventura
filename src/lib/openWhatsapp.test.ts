import { afterEach, describe, expect, it, vi } from 'vitest';
import { prepareWhatsappLaunch } from './openWhatsapp';

const URL = 'https://wa.me/5511999999999?text=Oi';

function setup({ coarse = false, blocked = false } = {}) {
  const tab = { closed: false, opener: {} as unknown, location: { href: '' }, close: vi.fn() };
  const open = vi
    .spyOn(window, 'open')
    .mockReturnValue(blocked ? null : (tab as unknown as Window));
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (q) => ({ matches: coarse && q.includes('coarse') }) as MediaQueryList,
  );
  const assign = vi.fn();
  vi.stubGlobal('location', { ...window.location, assign });
  return { tab, open, assign };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('prepareWhatsappLaunch', () => {
  it('desktop: abre a aba em branco na hora e navega nela no fim, sem opener', () => {
    const { tab, open, assign } = setup();
    const launch = prepareWhatsappLaunch();
    expect(open).toHaveBeenCalledWith('', '_blank');
    expect(tab.location.href).toBe('');
    launch.open(URL);
    expect(tab.opener).toBeNull();
    expect(tab.location.href).toBe(URL);
    expect(assign).not.toHaveBeenCalled();
  });

  it('desktop com popup bloqueado: navega na aba atual', () => {
    const { assign } = setup({ blocked: true });
    prepareWhatsappLaunch().open(URL);
    expect(assign).toHaveBeenCalledWith(URL);
  });

  it('mobile (pointer: coarse): não abre aba, navega na mesma', () => {
    const { open, assign } = setup({ coarse: true });
    prepareWhatsappLaunch().open(URL);
    expect(open).not.toHaveBeenCalled();
    expect(assign).toHaveBeenCalledWith(URL);
  });

  it('abort fecha a aba em branco e impede a navegação depois', () => {
    const { tab, assign } = setup();
    const launch = prepareWhatsappLaunch();
    launch.abort();
    launch.open(URL);
    expect(tab.close).toHaveBeenCalled();
    expect(tab.location.href).toBe('');
    expect(assign).not.toHaveBeenCalled();
  });
});
