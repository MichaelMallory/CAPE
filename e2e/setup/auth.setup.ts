import { test as setup, expect } from '@playwright/test';
import { TEST_USERS } from '../auth/test-users';
import path from 'path';

const authFile = path.join(__dirname, '../.auth/user.json');

setup('authenticate', async ({ page }) => {
  // Navigate to login page
  await page.goto('/login');
  console.log('Navigated to login page');

  // Fill in login details
  const email = TEST_USERS.STANDARD.email;
  const password = TEST_USERS.STANDARD.password;
  console.log('Attempting login with:', email);

  await page.getByRole('textbox', { name: /email/i }).fill(email);
  await page.getByLabel(/password/i).fill(password);
  
  // Add console log listener before clicking
  page.on('console', msg => {
    console.log(`Browser console: ${msg.type()}: ${msg.text()}`);
  });

  await page.getByRole('button', { name: /enter hq/i }).click();
  console.log('Clicked login button');

  // Wait for successful login and redirect with longer timeout and debug
  try {
    await expect(page).toHaveURL(/.*dashboard\/hero/, { timeout: 30000 });
    console.log('Successfully redirected to dashboard');
    await expect(page.getByRole('heading', { name: /cape hq/i })).toBeVisible();
    console.log('Dashboard heading visible');
  } catch (error) {
    // Log the current URL if redirect fails
    console.log('Current URL:', page.url());
    console.log('Page content:', await page.content());
    throw error;
  }

  // Save signed-in state
  await page.context().storageState({ path: authFile });
  console.log('Saved auth state to:', authFile);
}); 