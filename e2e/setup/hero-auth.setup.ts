import { test as setup, expect } from '@playwright/test';
import { TEST_USERS } from '../auth/test-users';
import path from 'path';

const authFile = path.join(__dirname, './hero-auth.json');

setup('authenticate hero', async ({ page }) => {
  // Navigate to login page
  await page.goto('/login');

  // Fill in login details for standard user (assumed to be a hero)
  const email = TEST_USERS.STANDARD.email;
  const password = TEST_USERS.STANDARD.password;

  await page.getByRole('textbox', { name: /email/i }).fill(email);
  await page.getByLabel(/password/i).fill(password);
  
  // Add console log listener for debugging
  page.on('console', msg => {
    console.log(`Browser console: ${msg.type()}: ${msg.text()}`);
  });

  await page.getByRole('button', { name: /enter hq/i }).click();

  // Wait for successful login and redirect
  try {
    await expect(page).toHaveURL(/.*dashboard\/hero/, { timeout: 30000 });
    await expect(page.getByRole('heading', { name: /Hero Dashboard/i })).toBeVisible();
  } catch (error) {
    console.log('Current URL:', page.url());
    console.log('Page content:', await page.content());
    throw error;
  }

  // Save signed-in state
  await page.context().storageState({ path: authFile });
}); 