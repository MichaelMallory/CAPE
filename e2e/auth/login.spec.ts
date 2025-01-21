import { test, expect } from '@playwright/test';
import { TEST_HERO_CODENAME, TEST_HERO_PASSWORD } from '../utils/test-constants';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('shows validation errors for empty fields', async ({ page }) => {
    await page.getByRole('button', { name: 'Enter HQ' }).click();
    await expect(page.getByText('Codename is required')).toBeVisible();
    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible();
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.getByPlaceholder('Enter your hero codename').fill('InvalidHero');
    await page.getByPlaceholder('••••••••').fill('wrongpassword');
    await page.getByRole('button', { name: 'Enter HQ' }).click();
    await expect(page.getByRole('alert')).toContainText('Invalid credentials');
  });

  test('successfully logs in and redirects to dashboard', async ({ page }) => {
    await page.getByPlaceholder('Enter your hero codename').fill(TEST_HERO_CODENAME);
    await page.getByPlaceholder('••••••••').fill(TEST_HERO_PASSWORD);
    await page.getByRole('button', { name: 'Enter HQ' }).click();
    
    // Check for success animation
    await expect(page.getByTestId('success-effect')).toBeVisible();
    
    // Wait for redirect
    await expect(page).toHaveURL('/dashboard');
  });

  test('redirects to MFA page for MFA-enabled users', async ({ page }) => {
    await page.getByPlaceholder('Enter your hero codename').fill('MFAHero');
    await page.getByPlaceholder('••••••••').fill(TEST_HERO_PASSWORD);
    await page.getByRole('button', { name: 'Enter HQ' }).click();
    await expect(page).toHaveURL('/login/mfa');
  });
}); 