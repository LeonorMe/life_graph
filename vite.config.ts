import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   injectRegister: 'auto',
    //   manifest: {
    //     name: 'InnerWeather - Emotion Graph',
    //     short_name: 'InnerWeather',
    //     description: 'Observe how your emotions change over time beautifully.',
    //     theme_color: '#f8fafc',
    //     background_color: '#f8fafc',
    //     display: 'standalone',
    //     orientation: 'portrait',
    //     icons: [
    //       {
    //         src: 'icon.png',
    //         sizes: '1024x1024',
    //         type: 'image/png'
    //       },
    //       {
    //         src: 'icon.png',
    //         sizes: '512x512',
    //         type: 'image/png',
    //         purpose: 'any maskable'
    //       }
    //     ]
    //   },
    //   workbox: {
    //     globPatterns: ['**/*.{js,css,html,ico,png,svg}']
    //   }
    // })
  ],
})
