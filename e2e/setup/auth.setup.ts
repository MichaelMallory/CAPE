import { test as setup, expect } from '@playwright/test';
import path from 'path';

// Auth file paths
const supportAuthFile = path.join(__dirname, '../.auth/support-staff.json');
const heroAuthFile = path.join(__dirname, '../.auth/hero.json');

async function isValidSession(page: any) {
  try {
    // Navigate to a page where we can access localStorage
    await page.goto('/');
    
    const token = await page.evaluate(() => localStorage.getItem('supabase.auth.token'));
    if (!token) return false;
    
    // Parse token and check expiry
    const parsed = JSON.parse(token);
    const expiresAt = parsed?.expiresAt;
    if (!expiresAt) return false;
    
    // Add 5 minute buffer before expiry
    return Date.now() < (expiresAt - 5 * 60 * 1000);
  } catch (e) {
    console.log('Session validation error:', e);
    return false;
  }
}

setup('authenticate support staff', async ({ page }) => {
  // Navigate to a page where we can access localStorage
  await page.goto('/');
  
  // Check for valid session first
  if (await isValidSession(page)) {
    console.log('Valid support staff session exists, skipping login');
    await page.context().storageState({ path: supportAuthFile });
    return;
  }

  // Clear any existing auth state
  await page.evaluate(() => localStorage.clear());
  
  // Perform login
  await page.goto('/login');
  await page.getByRole('textbox', { name: /email/i }).fill('support@hero-hq.com');
  await page.getByLabel(/password/i).fill('SupportPass123!');
  await page.getByRole('button', { name: /enter hq/i }).click();

  // Wait for successful login
  await expect(page).toHaveURL(/.*dashboard\/support/);
  
  // Save auth state
  await page.context().storageState({ path: supportAuthFile });
  console.log('Support staff auth state saved');
});

setup('authenticate hero', async ({ page }) => {
  // Navigate to a page where we can access localStorage
  await page.goto('/');
  
  // Check for valid session first
  if (await isValidSession(page)) {
    console.log('Valid hero session exists, skipping login');
    await page.context().storageState({ path: heroAuthFile });
    return;
  }

  // Clear any existing auth state
  await page.evaluate(() => localStorage.clear());
  
  // Perform login
  await page.goto('/login');
  await page.getByRole('textbox', { name: /email/i }).fill('hero@hero-hq.com');
  await page.getByLabel(/password/i).fill('HeroPass123!');
  await page.getByRole('button', { name: /enter hq/i }).click();

  // Wait for successful login
  await expect(page).toHaveURL(/.*dashboard\/hero/);
  
  // Save auth state
  await page.context().storageState({ path: heroAuthFile });
  console.log('Hero auth state saved');
}); 