import { test, expect } from '@playwright/test';
import { TEST_USERS } from './test-users';
import path from 'path';

const authFile = path.join(__dirname, '../.auth/user.json');

test.describe('Login Flow', () => {
  // Clear storage state before each test to ensure clean state
  test.use({ storageState: undefined });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test.describe('Form Validation', () => {
    test('shows validation errors for empty fields', async ({ page }) => {
      const signInButton = page.getByRole('button', { name: /enter hq/i });
      await signInButton.waitFor({ state: 'visible' });
      await signInButton.evaluate((button: HTMLButtonElement) => button.click());
      
      await expect(page.getByText('Email is required')).toBeVisible();
      await expect(page.getByText('Password is required')).toBeVisible();
    });

    test('shows validation error for invalid email format', async ({ page }) => {
      const emailInput = page.getByLabel(/email/i);
      const passwordInput = page.getByLabel(/password/i);
      const signInButton = page.getByRole('button', { name: /enter hq/i });

      await emailInput.waitFor({ state: 'visible' });
      await passwordInput.waitFor({ state: 'visible' });
      await signInButton.waitFor({ state: 'visible' });

      await emailInput.fill('invalid-email');
      await passwordInput.fill('anypassword');
      await signInButton.evaluate((button: HTMLButtonElement) => button.click());
      
      await expect(page.getByText(/invalid email/i)).toBeVisible();
    });

    test('shows error for invalid credentials', async ({ page }) => {
      const emailInput = page.getByLabel(/email/i);
      const passwordInput = page.getByLabel(/password/i);
      const signInButton = page.getByRole('button', { name: /enter hq/i });

      await emailInput.waitFor({ state: 'visible' });
      await passwordInput.waitFor({ state: 'visible' });
      await signInButton.waitFor({ state: 'visible' });

      await emailInput.fill(TEST_USERS.INVALID.email);
      await passwordInput.fill(TEST_USERS.INVALID.password);
      await signInButton.evaluate((button: HTMLButtonElement) => button.click());
      
      await expect(page.getByTestId('error-message')).toContainText(/invalid login credentials/i);
    });
  });

  test.describe('Successful Login', () => {
    test('prevents double submission during login', async ({ page }) => {
      const emailInput = page.getByLabel(/email/i);
      const passwordInput = page.getByLabel(/password/i);
      const signInButton = page.getByRole('button', { name: /enter hq/i });

      // Fill in valid credentials
      await emailInput.fill(TEST_USERS.STANDARD.email);
      await passwordInput.fill(TEST_USERS.STANDARD.password);

      // Wait for button to be ready
      await signInButton.waitFor({ state: 'visible' });

      // Click the button using evaluate to avoid WebKit issues
      await signInButton.evaluate((button: HTMLButtonElement) => button.click());
      
      // Try to click again - this should be prevented by the disabled state
      const secondClick = signInButton.evaluate((button: HTMLButtonElement) => button.click());
      await expect(secondClick).rejects.toThrow();

      // Wait for successful navigation to confirm the first click worked
      await page.waitForURL(/.*dashboard.*/);
    });

    test('successfully logs in and redirects to dashboard', async ({ page }) => {
      const emailInput = page.getByLabel(/email/i);
      const passwordInput = page.getByLabel(/password/i);
      const signInButton = page.getByRole('button', { name: /enter hq/i });

      await emailInput.waitFor({ state: 'visible' });
      await passwordInput.waitFor({ state: 'visible' });
      await signInButton.waitFor({ state: 'visible' });

      await emailInput.fill(TEST_USERS.STANDARD.email);
      await passwordInput.fill(TEST_USERS.STANDARD.password);
      await signInButton.evaluate((button: HTMLButtonElement) => button.click());
      
      // Wait for navigation and verify the page
      await page.waitForURL(/.*dashboard\/hero/);
      await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
    });
  });
}); 