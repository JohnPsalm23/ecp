import { test, expect } from '@playwright/test';

// Use stored auth state for authenticated tests
test.use({ storageState: 'playwright/.auth/user.json' });

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('should display dashboard metrics', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
    
    // Check for metric cards
    await expect(page.getByText(/today's orders/i)).toBeVisible();
    await expect(page.getByText(/active photographers/i)).toBeVisible();
    await expect(page.getByText(/today's revenue/i)).toBeVisible();
    await expect(page.getByText(/qc pass rate/i)).toBeVisible();
  });

  test('should display recent orders', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /recent orders/i })).toBeVisible();
    
    // Check for order table/list
    await expect(page.getByText(/ord-/i).first()).toBeVisible();
  });

  test('should display today\'s schedule', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /today's schedule/i })).toBeVisible();
  });

  test('should display QC summary', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /qc summary/i })).toBeVisible();
    await expect(page.getByText(/passed/i)).toBeVisible();
    await expect(page.getByText(/warnings/i)).toBeVisible();
    await expect(page.getByText(/failed/i)).toBeVisible();
  });

  test('should navigate to orders page', async ({ page }) => {
    await page.getByRole('link', { name: /orders/i }).click();
    
    await expect(page).toHaveURL('/dashboard/orders');
    await expect(page.getByRole('heading', { name: /orders/i })).toBeVisible();
  });

  test('should navigate to QC page', async ({ page }) => {
    await page.getByRole('link', { name: /quality control/i }).click();
    
    await expect(page).toHaveURL('/dashboard/qc');
    await expect(page.getByRole('heading', { name: /quality control/i })).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  test('should show sidebar navigation', async ({ page }) => {
    await page.goto('/dashboard');
    
    await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /calendar/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /orders/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /customers/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /photographers/i })).toBeVisible();
  });

  test('should toggle mobile sidebar', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    
    // Sidebar should be hidden on mobile
    await expect(page.getByRole('button', { name: /menu/i })).toBeVisible();
    
    // Click menu to open sidebar
    await page.getByRole('button', { name: /menu/i }).click();
    
    // Sidebar should now be visible
    await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
  });

  test('should show user menu', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Find and click user menu trigger
    await page.locator('[data-testid="user-menu"]').click();
    
    await expect(page.getByText(/profile/i)).toBeVisible();
    await expect(page.getByText(/settings/i)).toBeVisible();
    await expect(page.getByText(/sign out/i)).toBeVisible();
  });
});
