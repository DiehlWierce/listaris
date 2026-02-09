import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
      },
      manifest: {
        name: 'Листарис',
        short_name: 'Листарис',
        description: 'Инкрементальная игра про археолога, раскрывающего тайны древней цивилизации',
        theme_color: '#090c12',
        start_url: '/',
        display: 'standalone',
        background_color: '#090c12',
        icons: [
          {
            src: 'icon-128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  base: '/listaris/'
})
