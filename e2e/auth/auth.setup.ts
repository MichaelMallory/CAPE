import { test as setup } from '@playwright/test';
import { TEST_USERS, STORAGE_STATE } from '../utils/test-constants';

setup('authenticate as test user', async ({ page }) => {
  // Go to login page
  await page.goto('/login');

  // Fill in credentials
  await page.getByLabel('Codename').fill(TEST_USERS.STANDARD.codename);
  await page.getByLabel('Password').fill(TEST_USERS.STANDARD.password);
  await page.getByRole('button', { name: 'Enter HQ' }).click();

  // Wait for success and redirect
  await page.waitForURL('/dashboard');

  // Save signed-in state
  await page.context().storageState({ path: STORAGE_STATE });
}); 