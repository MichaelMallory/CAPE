import { test, expect } from '@playwright/test';

// Skip auth setup for these UI tests
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login Page UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('login page loads with all elements', async ({ page }) => {
    // Verify page title
    await expect(page.getByRole('heading', { name: /welcome to cape/i })).toBeVisible();
    
    // Verify form elements
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Enter HQ' })).toBeVisible();
    
    // Verify request access link
    await expect(page.getByRole('link', { name: /request access/i })).toBeVisible();
  });

  test('form elements are interactive', async ({ page }) => {
    // Wait for elements to be ready
    const emailInput = page.getByLabel('Email');
    const passwordInput = page.getByLabel('Password');
    
    await emailInput.waitFor({ state: 'visible' });
    await passwordInput.waitFor({ state: 'visible' });
    
    // Check input fields are enabled
    await expect(emailInput).toBeEnabled();
    await expect(passwordInput).toBeEnabled();
    
    // Verify can type in fields
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');
    
    // Verify values were entered
    await expect(emailInput).toHaveValue('test@example.com');
    await expect(passwordInput).toHaveValue('password123');
  });

  test('login button is styled correctly', async ({ page }) => {
    const loginButton = page.getByRole('button', { name: 'Enter HQ' });
    await loginButton.waitFor({ state: 'visible' });
    
    // Check button has expected classes
    await expect(loginButton).toHaveClass(/.*primary.*/);
    
    // Check hover state by checking the hover class exists in the button's classes
    await expect(loginButton).toHaveClass(/.*hover:bg-primary.*/)
  });
}); 