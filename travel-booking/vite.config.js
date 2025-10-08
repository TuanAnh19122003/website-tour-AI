import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,        // lắng nghe tất cả interface, bao gồm IP LAN
    port: 5173,        // giữ port cố định
  },
})
