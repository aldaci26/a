import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// If building for Electron (ELECTRON_BUILD=true), use relative './' so files load via file:// protocol
// If building for GitHub Pages deployment (DEPLOY_PAGES=true or GITHUB_PAGES=true), use repo path '/a/'
// Default is './' for local/standalone/electron compatibility
const base = process.env.ELECTRON_BUILD === 'true'
  ? './'
  : (process.env.DEPLOY_PAGES === 'true' || (process.env.GITHUB_ACTIONS && !process.env.ELECTRON_BUILD) ? '/a/' : './');

export default defineConfig({
  base,

  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'apple-touch-icon.png', 'icon.svg'],
      manifest: {
        id: 'kitaplik-app',
        name: 'Kitaplığım — Kişisel Kitaplık',
        short_name: 'Kitaplığım',
        description: 'Sinematik koyu temalı, doğal ortam sesli kişisel kütüphane ve kitap takip uygulaması.',
        theme_color: '#09090b',
        background_color: '#09090b',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: './',
        scope: './',
        categories: ['books', 'lifestyle', 'productivity'],
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/gh\/remvze\/moodist@main\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ambient-sounds-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 60
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],

  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true
  }
});

