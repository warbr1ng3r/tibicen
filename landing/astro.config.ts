import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  site: 'https://tibicen.pages.dev',
  base: process.env.TIBICEN_SITE_BASE ?? '/',
  devToolbar: { enabled: false },
  vite: { plugins: [tailwindcss()] },
});
