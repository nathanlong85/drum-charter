import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    exclude: ['**/node_modules/**', '**/tests/e2e/**'],
    alias: {
      '@': path.resolve(__dirname, './'),
    },
    coverage: {
      provider: 'v8',
      include: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}'],
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/__tests__/**',
        'lib/supabase/database.types.ts',
        'tests/**',
      ],
      thresholds: {
        lines: 63,
        functions: 61,
        branches: 56,
        statements: 62,
        'lib/**': {
          lines: 75,
          functions: 78,
          branches: 68,
          statements: 75,
        },
      },
    },
  },
});
