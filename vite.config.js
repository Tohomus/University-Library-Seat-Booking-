import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "icons/icon-192.png",
        "icons/icon-512.png"
      ],
      manifest: {
        name: "CUSAT Library Seat Booking",
        short_name: "CUSAT Library",
        description: "Seat booking system for CUSAT University Library",
        start_url: "/",
        display: "standalone",
        background_color: "#EEF2FF",
        theme_color: "#4F46E5",
        orientation: "portrait",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    })
  ]
})
