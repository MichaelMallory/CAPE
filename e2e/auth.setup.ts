import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '.auth/auth.json');

setup('authenticate', async ({ page }) => {
  // Navigate to the login page
  await page.goto('/login');

  // Fill in the hero credentials
  await page.getByRole('textbox', { name: /codename/i }).fill(process.env.TEST_HERO_CODENAME || 'TestHero');
  await page.getByRole('textbox', { name: /password/i }).fill(process.env.TEST_HERO_PASSWORD || 'test-password');
  
  // Click the login button
  await page.getByRole('button', { name: /sign in/i }).click();
  
  // Wait for successful login - verify we're redirected to dashboard
  await expect(page.getByRole('heading', { name: /mission control/i })).toBeVisible();
  
  // Save signed-in state to 'auth.json'
  await page.context().storageState({ path: authFile });
}); 