// @ts-check
import { defineConfig } from 'astro/config';
import path from 'path';
import { fileURLToPath } from 'url';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

import { visualizer } from 'rollup-plugin-visualizer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  // Add site URL for SEO (MKT-03)
  site: 'https://vwcg.app',

  integrations: [react(), sitemap()],

  // Build optimizations (PRF-03)
  build: {
    // Inline CSS files < 4KB to reduce request count
    inlineStylesheets: 'auto',
  },

  vite: {
    plugins: [
      visualizer({
        open: false,
        filename: './dist/stats.html',
        template: 'treemap',
        gzipSize: true,
        brotliSize: true,
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@layouts': path.resolve(__dirname, './src/layouts'),
        '@lib': path.resolve(__dirname, './src/lib'),
        '@stores': path.resolve(__dirname, './src/stores'),
        '@types': path.resolve(__dirname, './src/types'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          // Split vendor bundles for better caching
          manualChunks: (id) => {
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
              return 'react-vendor';
            }
          },
        },
      },
    },
  }
});
