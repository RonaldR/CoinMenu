import { fileURLToPath, URL } from 'node:url';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

import pkg from './package.json' with { type: 'json' };

const CONTENT_SECURITY_POLICY = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://static.coinpaprika.com",
    "connect-src https://api.coinpaprika.com",
].join('; ');

// Vite's dev server relies on inline scripts and a websocket for hot reload, so the policy only
// ships with production builds (the ones Electron loads from disk).
function contentSecurityPolicy() {
    return {
        name: 'coinmenu:content-security-policy',
        apply: 'build',
        transformIndexHtml: () => [{
            tag: 'meta',
            attrs: { 'http-equiv': 'Content-Security-Policy', content: CONTENT_SECURITY_POLICY },
            injectTo: 'head-prepend',
        }],
    };
}

export default defineConfig({
    base: './',
    define: { __APP_VERSION__: JSON.stringify(pkg.version) },
    plugins: [vue(), contentSecurityPolicy()],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    server: { host: '127.0.0.1', port: 5173, strictPort: true },
    // Formatting follows the system locale; tests pin one so they pass on every machine.
    test: { include: ['src/**/*.test.js'], env: { LC_ALL: 'en_US.UTF-8', LANG: 'en_US.UTF-8' } },
});
