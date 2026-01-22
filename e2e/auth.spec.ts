import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.describe('Login', () => {
    test('should show login page', async ({ page }) => {
      await page.goto('/login');
      
      await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
      await expect(page.getByPlaceholder(/email/i)).toBeVisible();
      await expect(page.getByPlaceholder(/password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    });

    test('should show validation errors for empty form', async ({ page }) => {
      await page.goto('/login');
      
      await page.getByRole('button', { name: /sign in/i }).click();
      
      await expect(page.getByText(/please enter a valid email/i)).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');
      
      await page.getByPlaceholder(/email/i).fill('invalid@test.com');
      await page.getByPlaceholder(/password/i).fill('wrongpassword');
      await page.getByRole('button', { name: /sign in/i }).click();
      
      await expect(page.getByText(/invalid/i)).toBeVisible({ timeout: 10000 });
    });

    test('should navigate to register page', async ({ page }) => {
      await page.goto('/login');
      
      await page.getByRole('link', { name: /create account/i }).click();
      
      await expect(page).toHaveURL('/register');
    });
  });

  test.describe('Registration', () => {
    test('should show registration form', async ({ page }) => {
      await page.goto('/register');
      
      await expect(page.getByRole('heading', { name: /create an account/i })).toBeVisible();
      await expect(page.getByPlaceholder(/first name/i)).toBeVisible();
      await expect(page.getByPlaceholder(/last name/i)).toBeVisible();
    });

    test('should validate password requirements', async ({ page }) => {
      await page.goto('/register');
      
      await page.getByPlaceholder(/first name/i).fill('Test');
      await page.getByPlaceholder(/last name/i).fill('User');
      await page.locator('input[name="email"]').fill('test@example.com');
      await page.locator('input[name="password"]').fill('short');
      await page.locator('input[name="confirmPassword"]').fill('short');
      
      await page.getByRole('button', { name: /create account/i }).click();
      
      await expect(page.getByText(/at least 8 characters/i)).toBeVisible();
    });

    test('should validate password confirmation', async ({ page }) => {
      await page.goto('/register');
      
      await page.getByPlaceholder(/first name/i).fill('Test');
      await page.getByPlaceholder(/last name/i).fill('User');
      await page.locator('input[name="email"]').fill('test@example.com');
      await page.locator('input[name="password"]').fill('validpassword123');
      await page.locator('input[name="confirmPassword"]').fill('differentpassword');
      
      await page.getByRole('button', { name: /create account/i }).click();
      
      await expect(page.getByText(/passwords don't match/i)).toBeVisible();
    });
  });
});
