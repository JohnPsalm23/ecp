import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration
 */
export default defineConfig({
  testDir: './e2e',
  
  // Run tests in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Limit workers on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
    process.env.CI ? ['github'] : ['list'],
  ],
  
  // Shared settings
  use: {
    // Base URL for navigation
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    
    // Collect trace on failure
    trace: 'on-first-retry',
    
    // Take screenshot on failure
    screenshot: 'only-on-failure',
    
    // Record video on failure
    video: 'on-first-retry',
    
    // Viewport
    viewport: { width: 1280, height: 720 },
    
    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,
  },

  // Configure projects for major browsers
  projects: [
    // Setup project - runs before all tests
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
    },

    // Mobile browsers
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
      dependencies: ['setup'],
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
      dependencies: ['setup'],
    },
  ],

  // Local dev server
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  
  // Global setup/teardown
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',
  
  // Test timeout
  timeout: 30000,
  
  // Expect timeout
  expect: {
    timeout: 5000,
  },
});
