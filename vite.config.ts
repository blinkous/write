import react from '@vitejs/plugin-react'
import { getLicenseFileText } from 'generate-license-file'
import type { Plugin } from 'vite'
import { defineConfig } from 'vitest/config'

/*
 * localStorage is scoped to the origin (protocol + host + port). A dedicated,
 * fixed port keeps the journal from sharing storage with other local projects
 * and from "losing" entries when a busy port makes Vite pick another one.
 */
const APP_PORT = 4791

const FONT_FILE_PATTERN = /\.woff2?$/

/*
 * Only scripts bundled with the app may run, and no network requests are
 * allowed, so injected content can't read or send the journal anywhere.
 */
const CONTENT_SECURITY_POLICY = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self'",
  "font-src 'self'",
  // blob: is the background picture or video, read from this browser's own storage.
  "img-src 'self' data: blob:",
  'media-src blob:',
  "connect-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "object-src 'none'",
].join('; ')

/* Build-only: the dev server needs inline scripts and a websocket for hot reload. */
function contentSecurityPolicy(): Plugin {
  return {
    name: 'content-security-policy',
    apply: 'build',
    transformIndexHtml: () => [
      {
        tag: 'meta',
        attrs: {
          'http-equiv': 'Content-Security-Policy',
          content: CONTENT_SECURITY_POLICY,
        },
        injectTo: 'head-prepend',
      },
    ],
  }
}

const THIRD_PARTY_LICENSES_FILE = 'THIRD_PARTY_LICENSES.txt'

/*
 * Build-only: ships the license and copyright notice of every production
 * dependency next to the app, as the fonts' OFL and the MIT, Apache and BSD
 * licenses require. Read from package.json, so CSS-only packages (fonts) count.
 */
function thirdPartyLicenses(): Plugin {
  return {
    name: 'third-party-licenses',
    apply: 'build',
    async generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: THIRD_PARTY_LICENSES_FILE,
        source: await getLicenseFileText('package.json', { lineEnding: 'lf' }),
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), contentSecurityPolicy(), thirdPartyLicenses()],
  build: {
    // Emit fonts as files: the CSP's font-src 'self' doesn't allow data: URLs.
    assetsInlineLimit: (filePath) =>
      FONT_FILE_PATTERN.test(filePath) ? false : undefined,
  },
  server: { host: 'localhost', port: APP_PORT, strictPort: true },
  preview: { host: 'localhost', port: APP_PORT, strictPort: true },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    // Real contents for CSS that tests compare against (vendored Tiptap CSS, design tokens).
    css: { include: [/tiptapBase\.css/, /tokens\.css/] },
  },
})
