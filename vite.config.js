// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
      },
      manifest: {
        name: 'Листарис',
        short_name: 'Листарис',
        description: 'Инкрементальная игра про археолога, раскрывающего тайны древней цивилизации',
        theme_color: '#090c12', // Используем твой темный цвет
        start_url: '/',
        display: 'standalone',
        background_color: '#090c12',
        icon: 'public/icon-512.png', // Убедись, что файл есть в public/
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
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
  // Если ты планируешь деплоить на GitHub Pages в репозиторий с именем user.github.io/repo-name,
  // раскомментируй и укажи base: '/repo-name/'
  base: '/listaris/', // Пример, измени на своё имя репо
})