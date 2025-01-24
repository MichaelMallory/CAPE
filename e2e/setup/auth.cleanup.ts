import { test as setup } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const supportAuthFile = path.join(__dirname, '../.auth/support-staff.json');
const heroAuthFile = path.join(__dirname, '../.auth/hero.json');

setup('cleanup auth state', async ({ page }) => {
  // Clear browser storage
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  // Remove auth files
  try {
    if (fs.existsSync(supportAuthFile)) {
      fs.unlinkSync(supportAuthFile);
      console.log('Removed support auth file');
    }
    if (fs.existsSync(heroAuthFile)) {
      fs.unlinkSync(heroAuthFile);
      console.log('Removed hero auth file');
    }
  } catch (e) {
    console.error('Error cleaning up auth files:', e);
  }
}); 