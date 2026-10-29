import type { ReactNode } from 'react';

/**
 * Editor visual e prévia: telas cheias, sem a barra lateral do painel. A conferência de sessão e
 * permissão é de cada página (requirePageUser) — o proxy já barra quem não está logado.
 */
export default function EditorGroupLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
