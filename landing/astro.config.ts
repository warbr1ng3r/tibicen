import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  base: process.env.TIBICEN_SITE_BASE ?? '/',
  devToolbar: { enabled: false },
  vite: { plugins: [tailwindcss()] },
});
