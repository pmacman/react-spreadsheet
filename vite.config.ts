/**
 * This project uses Vitest because it integrates directly with Vite's
 * ESM and module resolution. Using Jest in this environment requires
 * additional configuration and tsconfig divergence.
 */
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vitest/config';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Path aliases
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setupTests.ts',
    globals: true,
  },
});
