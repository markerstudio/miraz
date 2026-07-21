import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// The single-file plugin (plus a huge inline limit so the SVG logo assets
// become data URIs) lets `npm run build` emit one self-contained
// dist/index.html — handy for artifacts/PWA-style sharing.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    assetsInlineLimit: 100000000,
  },
})
