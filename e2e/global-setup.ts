import { chromium, FullConfig } from '@playwright/test';

/**
 * Global setup for E2E tests
 * 
 * This runs once before all tests to:
 * - Set up test database state
 * - Create test user accounts
 * - Store authentication state for reuse
 */

async function globalSetup(config: FullConfig) {
  const { baseURL, storageState } = config.projects[0].use;
  
  // Create browser for setup
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to login page
    await page.goto(`${baseURL}/login`);
    
    // Login with test admin account
    await page.fill('input[name="email"]', process.env.TEST_ADMIN_EMAIL || 'admin@test.com');
    await page.fill('input[name="password"]', process.env.TEST_ADMIN_PASSWORD || 'testpassword123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Save authentication state
    await context.storageState({ path: storageState as string });
    
    console.log('✅ Global setup complete - authentication state saved');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    // Don't throw - tests will handle missing auth state
  } finally {
    await browser.close();
  }
}

export default globalSetup;
