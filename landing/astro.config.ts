import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  site: 'https://warbr1ng3r.github.io',
  base: process.env.TIBICEN_SITE_BASE ?? '/',
  devToolbar: { enabled: false },
  vite: { plugins: [tailwindcss()] },
});
