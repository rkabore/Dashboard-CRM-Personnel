import { defineConfig } from '@playwright/test'

export default defineConfig({
  projects: [
    {
      name: 'unit',
      testDir: './tests/unit',
      use: {},
    },
  ],
})

// E2E config is in playwright.e2e.config.ts
