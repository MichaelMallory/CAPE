import { test as setup } from '@playwright/test';
import path from 'path';

// Storage state for admin user session
export const adminUser = path.join(process.cwd(), 'e2e/.auth/admin.json');

setup('authenticate as admin user', async ({ page }) => {
  // Go to login page
  await page.goto('/login');

  // Fill in admin credentials
  await page.getByLabel('Codename').fill(process.env.ADMIN_CODENAME || 'AdminHero');
  await page.getByLabel('Password').fill(process.env.ADMIN_PASSWORD || 'admin-password-123!');
  await page.getByRole('button', { name: 'Enter HQ' }).click();

  // Wait for success and redirect
  await page.waitForURL('/dashboard');

  // Save signed-in state
  await page.context().storageState({ path: adminUser });
}); 