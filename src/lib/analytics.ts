export type WhatsappPlacement = 'header' | 'hero' | 'cta' | 'float' | 'form' | 'footer';

interface AnalyticsWindow extends Window {
  dataLayer?: Record<string, unknown>[];
  gtag?: (...args: unknown[]) => void;
  fbq?: (...args: unknown[]) => void;
}

/** Evento `whatsapp_click` para GA4 (gtag/dataLayer) e Meta Pixel, quando presentes. */
export function trackWhatsappClick(params: { page: string; placement: WhatsappPlacement }) {
  if (typeof window === 'undefined') return;
  const w = window as AnalyticsWindow;
  w.dataLayer?.push({ event: 'whatsapp_click', ...params });
  w.gtag?.('event', 'whatsapp_click', params);
  w.fbq?.('trackCustom', 'whatsapp_click', params);
}
