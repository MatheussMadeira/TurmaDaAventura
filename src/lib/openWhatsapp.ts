export interface WhatsappLaunch {
  /** Leva para o WhatsApp (chame depois da animação). */
  open: (url: string) => void;
  /** Cancela (ex.: desmontou antes do fim): fecha a aba em branco, se ainda for a nossa. */
  abort: () => void;
}

/**
 * Abre o WhatsApp depois de uma animação sem cair no bloqueador de popup.
 * Chame `prepareWhatsappLaunch()` de forma SÍNCRONA dentro do handler do clique/submit e
 * `open(url)` quando a animação acabar.
 *
 * - Desktop: abre já uma aba em branco (gesto do usuário); no fim, `opener = null` e navega nela.
 *   Se o navegador bloqueou (window.open → null), navega na aba atual.
 * - Mobile (pointer: coarse): sem aba nova; navega na mesma aba no fim.
 */
export function prepareWhatsappLaunch(): WhatsappLaunch {
  const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false;
  const tab = coarse ? null : window.open('', '_blank');
  let done = false;

  return {
    open(url) {
      if (done) return;
      done = true;
      if (coarse || tab === null) {
        window.location.assign(url);
      } else if (!tab.closed) {
        tab.opener = null;
        tab.location.href = url;
      }
      /* aba fechada pela pessoa de propósito: não forçamos a navegação */
    },
    abort() {
      if (done) return;
      done = true;
      if (tab && !tab.closed) tab.close();
    },
  };
}
