import { FullConfig } from '@playwright/test';

/**
 * Global teardown for E2E tests
 * 
 * This runs once after all tests to:
 * - Clean up test data
 * - Reset database state
 */

async function globalTeardown(config: FullConfig) {
  // Add cleanup logic here if needed
  console.log('🧹 Global teardown complete');
}

export default globalTeardown;
