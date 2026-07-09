import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
});
