'use client';

import { Button } from '@/components/atoms/Button';
import { Box } from '@/admin/ui/layout';
import { EmptyState } from '@/admin/ui/states';

/** Erro inesperado numa tela do painel: mensagem amigável no lugar da tela, sem stack trace. */
export default function PanelError({ reset }: { error: Error; reset: () => void }) {
  return (
    <Box>
      <EmptyState
        title="Não foi possível abrir esta tela"
        action={<Button onClick={reset}>Tentar de novo</Button>}
      >
        O site continua no ar. Tente de novo; se continuar, avise quem cuida do site.
      </EmptyState>
    </Box>
  );
}
