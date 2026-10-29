'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { trackWhatsappClick } from '@/lib/analytics';
import { useQuoteCovered } from '@/lib/quoteVisibility';
import { messageForPath, whatsappUrl } from '@/lib/whatsapp';
import { Icon } from '../../atoms/Icon';
import { Label, Root } from './WhatsAppFloat.styles';

export interface WhatsAppFloatProps {
  phone?: string;
  /** padrão: a mensagem da rota atual */
  message?: string;
  /** rótulo visível ao lado do ícone (some abaixo de 640px) */
  label?: string;
  /** desliga position: fixed e a entrada atrasada (para documentação) */
  inline?: boolean;
  /** ms até aparecer (padrão 1500); também aparece ao rolar 30% da página */
  delay?: number;
  /** pulso sutil a cada 20s; padrão true */
  pulse?: boolean;
  className?: string;
}

export function WhatsAppFloat({
  phone,
  message,
  label,
  inline = false,
  delay = 1500,
  pulse = true,
  className,
}: WhatsAppFloatProps) {
  const pathname = usePathname();
  const [shown, setShown] = useState(inline);
  const [scrolling, setScrolling] = useState(false);
  const covered = useQuoteCovered();
  const stopTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (inline) return;
    const t = window.setTimeout(() => setShown(true), delay);
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max > 0.3) setShown(true);
      setScrolling(true);
      window.clearTimeout(stopTimer.current);
      stopTimer.current = window.setTimeout(() => setScrolling(false), 200);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(stopTimer.current);
      window.removeEventListener('scroll', onScroll);
    };
  }, [inline, delay]);

  const visible = shown && !covered;

  return (
    <Root
      $inline={inline}
      $pulse={pulse}
      className={className}
      data-shown={visible}
      data-scrolling={scrolling}
      tabIndex={visible ? undefined : -1}
      href={whatsappUrl(message ?? messageForPath(pathname), phone)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com a Turma da Aventura no WhatsApp"
      onClick={() => trackWhatsappClick({ page: pathname ?? '/', placement: 'float' })}
    >
      <Icon name="whatsapp" size={30} />
      {label ? <Label>{label}</Label> : null}
    </Root>
  );
}
