import type { Locale } from '../../i18n';

export interface Headline {
  title: string;
  subtitle?: string;
  tagline?: string;
}
export interface Widget extends Headline {
  id: string;
}
export interface Item {
  title: string;
  description: string;
  label?: string;
  prompt?: string;
}
export interface Features extends Widget {
  locale?: Locale;
  items: Item[];
}
export interface Faqs extends Widget {
  items: Item[];
  defaultOpen?: number;
}
