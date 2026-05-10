import { defineConfig } from '@playwright/test'

export default defineConfig({
  projects: [
    {
      name: 'e2e',
      testDir: './tests/e2e',
      use: {
        baseURL: 'http://localhost:3000',
        browserName: 'chromium',
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000/dashboard',
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
})
