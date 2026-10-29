'use client';

import { usePathname } from 'next/navigation';
import { trackWhatsappClick, type WhatsappPlacement } from '@/lib/analytics';
import { messageForPath, whatsappUrl } from '@/lib/whatsapp';
import { Button, type ButtonProps } from '../../atoms/Button';

export interface WhatsAppButtonProps extends Omit<ButtonProps, 'href' | 'iconLeft'> {
  /** só dígitos com DDI, ex.: "5511999999999"; padrão NEXT_PUBLIC_WHATSAPP */
  phone?: string;
  /** mensagem pré-preenchida — sempre contextual à página (padrão: a da rota atual) */
  message?: string;
  /** onde o botão está na página, para o evento `whatsapp_click` */
  placement?: WhatsappPlacement;
}

export function WhatsAppButton({
  phone,
  message,
  placement = 'cta',
  children,
  onClick,
  ...rest
}: WhatsAppButtonProps) {
  const pathname = usePathname();
  return (
    <Button
      variant="primary"
      iconLeft="whatsapp"
      href={whatsappUrl(message ?? messageForPath(pathname), phone)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        trackWhatsappClick({ page: pathname ?? '/', placement });
        onClick?.(e);
      }}
      {...rest}
    >
      {children ?? 'Pedir orçamento no WhatsApp'}
    </Button>
  );
}
