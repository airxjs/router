import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['source/**/*.test.ts'],
    environment: 'node',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['source/**/*.ts'],
      exclude: ['source/**/*.test.ts']
    }
  }
})
