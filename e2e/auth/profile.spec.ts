import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

// Create a simple 1x1 pixel base64 PNG image
const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

test.describe('Profile Management', () => {
  test.use({ storageState: 'e2e/.auth/auth.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/profile');
  });

  test('should display current profile information', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /hero profile management/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /codename/i })).toHaveValue(process.env.TEST_HERO_CODENAME || 'TestHero');
  });

  test('should update profile information', async ({ page }) => {
    // Update profile information
    await page.getByRole('textbox', { name: /powers/i }).fill('Super Strength, Flight');
    await page.getByRole('textbox', { name: /team affiliations/i }).fill('Justice League, Avengers');
    
    // Submit the form
    await page.getByRole('button', { name: /update profile/i }).click();
    
    // Verify success message
    await expect(page.getByText(/profile.*updated/i)).toBeVisible();
    
    // Verify the changes persist after reload
    await page.reload();
    await expect(page.getByRole('textbox', { name: /powers/i })).toHaveValue('Super Strength, Flight');
    await expect(page.getByRole('textbox', { name: /team affiliations/i })).toHaveValue('Justice League, Avengers');
  });

  test('should validate required fields', async ({ page }) => {
    // Clear required fields
    await page.getByRole('textbox', { name: /codename/i }).fill('');
    await page.getByRole('textbox', { name: /real name/i }).fill('');
    await page.getByRole('textbox', { name: /powers/i }).fill('');
    
    // Try to submit the form
    await page.getByRole('button', { name: /update profile/i }).click();
    
    // Verify validation messages
    await expect(page.getByText(/codename must be at least 2 characters/i)).toBeVisible();
    await expect(page.getByText(/real name must be at least 2 characters/i)).toBeVisible();
    await expect(page.getByText(/powers must be at least 2 characters/i)).toBeVisible();
  });

  test('should upload and display avatar image', async ({ page }) => {
    // Create a temporary test image file
    const testImagePath = path.join(__dirname, '../fixtures/test-avatar.png');
    fs.writeFileSync(testImagePath, Buffer.from(testImageBase64, 'base64'));
    
    // Upload the image
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: /choose avatar/i }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(testImagePath);
    
    // Wait for upload success effect
    await expect(page.locator('[data-testid="action-effect"]')).toBeVisible();
    
    // Verify avatar is displayed
    const avatar = page.getByRole('img', { name: /hero avatar/i });
    await expect(avatar).toBeVisible();
    
    // Verify the avatar URL is from Supabase storage
    const avatarSrc = await avatar.getAttribute('src');
    expect(avatarSrc).toContain('storage.googleapis.com');
    
    // Clean up the test image
    fs.unlinkSync(testImagePath);
  });
}); 