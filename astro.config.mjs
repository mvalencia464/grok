import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'static',
  integrations: [tailwind()],
  build: {
    inlineStylesheets: 'auto',
  },
  image: {
    formats: ['avif', 'webp'],
  },
});
