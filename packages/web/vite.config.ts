import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { sentryVitePlugin } from '@sentry/vite-plugin';

const sharedPath = path.resolve(__dirname, '../shared/src');

export default defineConfig({
  plugins: [
    react(),
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT_EATO_WEB,
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Map all @eato/shared/* subpath exports to source
      '@eato/shared': sharedPath,
      '@eato/shared/api': path.join(sharedPath, 'api'),
      '@eato/shared/types': path.join(sharedPath, 'types'),
      '@eato/shared/stores': path.join(sharedPath, 'stores'),
      '@eato/shared/utils': path.join(sharedPath, 'utils'),
      '@eato/shared/constants': path.join(sharedPath, 'constants'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  env: {
    VITE_SENTRY_DSN: process.env.VITE_SENTRY_DSN || '',
  },
});
