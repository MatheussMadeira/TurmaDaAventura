export type WhatsappPlacement = 'header' | 'hero' | 'cta' | 'float' | 'form' | 'footer' | 'bag';

interface AnalyticsWindow extends Window {
  dataLayer?: Record<string, unknown>[];
  gtag?: (...args: unknown[]) => void;
  fbq?: (...args: unknown[]) => void;
}

/** Evento `whatsapp_click` para GA4 (gtag/dataLayer) e Meta Pixel, quando presentes. */
export function trackWhatsappClick(params: {
  page: string;
  placement: WhatsappPlacement;
  /** pedido da sacola: produtos distintos e soma das quantidades */
  items?: number;
  units?: number;
}) {
  if (typeof window === 'undefined') return;
  const w = window as AnalyticsWindow;
  w.dataLayer?.push({ event: 'whatsapp_click', ...params });
  w.gtag?.('event', 'whatsapp_click', params);
  w.fbq?.('trackCustom', 'whatsapp_click', params);
}

/** Eventos da assinatura do criador no rodapé: `creator_credit_open` e `creator_credit_click`. */
export function trackCreatorCredit(
  event: 'creator_credit_open' | 'creator_credit_click',
  params: { network?: 'linkedin' | 'github' } = {},
) {
  if (typeof window === 'undefined') return;
  const w = window as AnalyticsWindow;
  w.dataLayer?.push({ event, ...params });
  w.gtag?.('event', event, params);
  w.fbq?.('trackCustom', event, params);
}
