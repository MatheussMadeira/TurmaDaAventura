import type * as React from 'react';

export type IconName =
  | 'whatsapp' | 'instagram' | 'menu' | 'close' | 'arrow-right' | 'chevron-down' | 'check'
  | 'map-pin' | 'clock' | 'calendar' | 'users' | 'compass' | 'tent' | 'tree' | 'leaf'
  | 'scissors' | 'palette' | 'utensils' | 'briefcase' | 'star' | 'flag' | 'backpack'
  | 'phone' | 'mail' | 'heart' | 'shield';

/* ---------- Átomos ---------- */
export interface RevealProps {
  /** elemento renderizado; padrão 'div' */
  as?: keyof JSX.IntrinsicElements;
  /** up = fade + 24px (padrão) · fade · scale = fade + 0.96→1 */
  effect?: 'up' | 'fade' | 'scale';
  /** escalona os filhos diretos (80ms cada, no máximo 6) — use no container do grid */
  stagger?: boolean;
  /** atraso extra em ms */
  delay?: number;
  /** fração visível que dispara a entrada; padrão 0.2 */
  threshold?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
export declare function Reveal(props: RevealProps): React.ReactElement;

export interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  name: IconName;
  /** px; padrão 24 */
  size?: number;
  /** Texto para leitores de tela. Sem label o ícone é decorativo (aria-hidden). */
  label?: string;
}
export declare function Icon(props: IconProps): React.ReactElement;

export type ButtonVariant = 'primary' | 'earth' | 'outline' | 'ghost' | 'inverse' | 'ghost-inverse';
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary = verde (ação principal); earth = marrom (secundária forte); inverse/ghost-inverse só sobre surface-forest */
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  iconLeft?: IconName;
  iconRight?: IconName;
  fullWidth?: boolean;
  /** Com href renderiza <a> (links externos: passe target/rel) */
  href?: string;
  target?: string;
  rel?: string;
}
export declare function Button(props: ButtonProps): React.ReactElement;

export interface TagProps {
  tone?: 'olive' | 'brand' | 'earth' | 'neutral';
  icon?: IconName;
  children?: React.ReactNode;
  className?: string;
}
export declare function Tag(props: TagProps): React.ReactElement;

export interface LogoProps {
  /** full = com slogan (rodapé, páginas institucionais) · compact = sem slogan (header) · symbol = só pegadas (favicon, avatar) · paw = só a pata (decoração) */
  variant?: 'full' | 'compact' | 'symbol' | 'paw';
  /** auto = verde no tema Dia e branco no tema Noite */
  tone?: 'green' | 'white' | 'auto';
  /** altura em px; largura segue a proporção */
  height?: number;
  href?: string;
  /** URLs próprias por chave "<variant>-<tone>" (ex.: "/brand/logo-compact-green.svg") */
  sources?: Partial<Record<string, string>>;
  className?: string;
}
export declare function Logo(props: LogoProps): React.ReactElement;

export interface MediaProps {
  src?: string | null;
  alt?: string;
  /** CSS aspect-ratio; padrão '4 / 3' */
  ratio?: string;
  /** Ícone mostrado no placeholder de camuflagem quando não há foto */
  icon?: IconName;
  caption?: string;
  rounded?: boolean;
  /** id estável do pattern SVG do placeholder (evita colisões e hidratação divergente no SSR) */
  placeholderId?: string;
  className?: string;
}
export declare function Media(props: MediaProps): React.ReactElement;

export interface CamoPatternProps {
  /** full = camuflagem cheia · soft = fundo de placeholder · forest = sobre surface-forest */
  tone?: 'full' | 'soft' | 'forest';
  /** id único do <pattern> na página */
  id?: string;
  scale?: number;
  className?: string;
}
export declare function CamoPattern(props: CamoPatternProps): React.ReactElement;

export interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  hint?: string;
  error?: string;
  /** vira <textarea> */
  multiline?: boolean;
  rows?: number;
}
export declare function TextField(props: TextFieldProps): React.ReactElement;

export interface SelectOption { value: string; label: string }
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Array<string | SelectOption>;
  placeholder?: string;
  hint?: string;
  error?: string;
}
export declare function Select(props: SelectProps): React.ReactElement;

/* ---------- Moléculas ---------- */
export interface SectionHeaderProps {
  overline?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: 'left' | 'center';
  /** 1 = título de página (h1), 2 = título de seção (padrão) */
  level?: 1 | 2;
  /** cores para surface-forest */
  onForest?: boolean;
  className?: string;
}
export declare function SectionHeader(props: SectionHeaderProps): React.ReactElement;

export interface WhatsAppButtonProps extends Omit<ButtonProps, 'href' | 'iconLeft'> {
  /** só dígitos com DDI, ex.: "5511999999999" */
  phone?: string;
  /** mensagem pré-preenchida — sempre contextual à página */
  message?: string;
}
export declare function WhatsAppButton(props: WhatsAppButtonProps): React.ReactElement;

export interface ServiceCardProps {
  title: string;
  description?: string;
  overline?: string;
  icon?: IconName;
  /** passe uma URL (ou null para o placeholder) para trocar o ícone por foto */
  image?: string | null;
  imageAlt?: string;
  tags?: string[];
  href?: string;
  linkLabel?: string;
  tone?: 'default' | 'earth';
  placeholderId?: string;
  className?: string;
}
export declare function ServiceCard(props: ServiceCardProps): React.ReactElement;

export interface RestaurantCardProps {
  name: string;
  neighborhood?: string;
  /** texto livre: "Sáb e dom, 12h às 17h" */
  schedule?: string;
  address?: string;
  ages?: string;
  image?: string;
  imageAlt?: string;
  /** logo do restaurante parceiro (quadrado, fundo transparente) */
  brandLogo?: string;
  mapsUrl?: string;
  placeholderId?: string;
  className?: string;
}
export declare function RestaurantCard(props: RestaurantCardProps): React.ReactElement;

export interface TeamCardProps {
  name: string;
  /** apelido de monitor: "Capitão Trilha" */
  nickname?: string;
  role?: string;
  bio?: string;
  photo?: string;
  /** certificações: "Primeiros socorros" */
  badges?: string[];
  className?: string;
}
export declare function TeamCard(props: TeamCardProps): React.ReactElement;

export interface ValuePillarProps {
  title: string;
  /** posição no trio (0, 1, 2) — escalona a entrada do selo */
  index?: number;
  text?: string;
  number?: string;
  icon?: IconName;
  tone?: 'brand' | 'olive' | 'earth';
  className?: string;
}
export declare function ValuePillar(props: ValuePillarProps): React.ReactElement;

/* ---------- Organismos ---------- */
export interface NavItem { label: string; href: string }
export interface HeaderProps {
  items?: NavItem[];
  /** href da página atual (aria-current) */
  current?: string;
  phone?: string;
  message?: string;
  defaultOpen?: boolean;
  /** desliga o comportamento de rolagem (encolher / esconder ao descer) */
  static?: boolean;
  /** força o estado "rolado" (documentação) */
  scrolled?: boolean;
  className?: string;
}
export declare function Header(props: HeaderProps): React.ReactElement;

export interface HeroProps {
  title: React.ReactNode;
  overline?: string;
  lead?: React.ReactNode;
  image?: string;
  imageAlt?: string;
  variant?: 'light' | 'forest';
  ctaLabel?: string;
  phone?: string;
  message?: string;
  secondary?: { label: string; href: string };
  highlights?: string[];
  className?: string;
}
export declare function Hero(props: HeroProps): React.ReactElement;

export interface TrailStep { title: string; text?: string; icon?: IconName }
export interface TrailProps { steps: TrailStep[]; className?: string }
export declare function Trail(props: TrailProps): React.ReactElement;

export interface CTABannerProps {
  title?: string;
  text?: string;
  ctaLabel?: string;
  phone?: string;
  message?: string;
  className?: string;
}
export declare function CTABanner(props: CTABannerProps): React.ReactElement;

export interface QuoteFormValues { nome: string; tipo: string; data: string; criancas: string; idades: string; cidade: string; msg: string }
export interface QuoteFormProps {
  phone?: string;
  title?: string;
  description?: string;
  eventTypes?: string[];
  /** recebe a URL wa.me já montada; sem ele o form abre o WhatsApp numa nova aba */
  onSubmit?: (whatsappUrl: string, values: QuoteFormValues) => void;
  className?: string;
}
export declare function QuoteForm(props: QuoteFormProps): React.ReactElement;

export interface FooterProps {
  items?: NavItem[];
  about?: string;
  phone?: string;
  phoneLabel?: string;
  instagram?: string;
  email?: string;
  city?: string;
  year?: number;
  className?: string;
}
export declare function Footer(props: FooterProps): React.ReactElement;

export interface WhatsAppFloatProps {
  phone?: string;
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
export declare function WhatsAppFloat(props: WhatsAppFloatProps): React.ReactElement;

export declare function whatsappUrl(phone?: string, message?: string): string;

declare global {
  interface Window {
    TDA: {
      Icon: typeof Icon; Reveal: typeof Reveal; Button: typeof Button; Tag: typeof Tag; Logo: typeof Logo; Media: typeof Media;
      CamoPattern: typeof CamoPattern; TextField: typeof TextField; Select: typeof Select;
      SectionHeader: typeof SectionHeader; WhatsAppButton: typeof WhatsAppButton; ServiceCard: typeof ServiceCard;
      RestaurantCard: typeof RestaurantCard; TeamCard: typeof TeamCard; ValuePillar: typeof ValuePillar;
      Header: typeof Header; Hero: typeof Hero; Trail: typeof Trail; CTABanner: typeof CTABanner;
      QuoteForm: typeof QuoteForm; Footer: typeof Footer; WhatsAppFloat: typeof WhatsAppFloat;
      whatsappUrl: typeof whatsappUrl;
      useInView: (ref: React.RefObject<Element>, opts?: { threshold?: number }) => boolean;
    };
  }
}
