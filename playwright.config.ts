import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';
import path from 'path';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */

// Load test environment variables
config({ path: path.join(__dirname, 'e2e/.env.test') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  globalSetup: require.resolve('./e2e/global-setup'),
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    /* Increase timeouts for auth operations */
    actionTimeout: 15000,
    navigationTimeout: 15000,
  },

  /* Configure projects for major browsers */
  projects: [
    // Setup projects for each auth type
    {
      name: 'setup-support',
      testMatch: '**/setup/support-auth.setup.ts',
      teardown: 'cleanup-support',
    },
    {
      name: 'cleanup-support',
      testMatch: '**/setup/auth.cleanup.ts',
    },
    {
      name: 'chromium-support',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/support-staff.json'
      },
      dependencies: ['setup-support']
    }
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  // Global timeout for all tests
  timeout: 30000,
  
  // Amount of time to wait for expected condition
  expect: {
    timeout: 15000,
  },

  outputDir: 'test-results/',
  testMatch: '**/*.spec.ts',
});
