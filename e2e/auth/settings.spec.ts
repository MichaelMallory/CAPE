import { test, expect } from '@playwright/test';

test.describe('Settings Panel', () => {
  test.use({ storageState: 'e2e/.auth/auth.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
  });

  test('should display settings panel with default values', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /hero settings/i })).toBeVisible();
    
    // Theme section
    await expect(page.getByRole('combobox', { name: /color theme/i })).toHaveValue('system');
    
    // Notification section
    await expect(page.getByRole('switch', { name: /mission updates/i })).toBeChecked();
    await expect(page.getByRole('switch', { name: /equipment status/i })).toBeChecked();
    await expect(page.getByRole('switch', { name: /team updates/i })).toBeChecked();
    await expect(page.getByRole('switch', { name: /priority alerts/i })).toBeChecked();
    
    // Accessibility section
    await expect(page.getByRole('switch', { name: /reduce motion/i })).not.toBeChecked();
    await expect(page.getByRole('switch', { name: /high contrast/i })).not.toBeChecked();
  });

  test('should update theme preference', async ({ page }) => {
    const themeSelect = page.getByRole('combobox', { name: /color theme/i });
    await themeSelect.click();
    await page.getByRole('option', { name: /dark/i }).click();
    
    await page.getByRole('button', { name: /save settings/i }).click();
    await expect(page.locator('[data-testid="settings-effect"]')).toBeVisible();
    
    // Verify persistence after reload
    await page.reload();
    await expect(themeSelect).toHaveValue('dark');
  });

  test('should toggle notification preferences', async ({ page }) => {
    // Toggle off all notifications
    await page.getByRole('switch', { name: /mission updates/i }).click();
    await page.getByRole('switch', { name: /equipment status/i }).click();
    await page.getByRole('switch', { name: /team updates/i }).click();
    await page.getByRole('switch', { name: /priority alerts/i }).click();
    
    await page.getByRole('button', { name: /save settings/i }).click();
    await expect(page.locator('[data-testid="settings-effect"]')).toBeVisible();
    
    // Verify all switches are off
    await expect(page.getByRole('switch', { name: /mission updates/i })).not.toBeChecked();
    await expect(page.getByRole('switch', { name: /equipment status/i })).not.toBeChecked();
    await expect(page.getByRole('switch', { name: /team updates/i })).not.toBeChecked();
    await expect(page.getByRole('switch', { name: /priority alerts/i })).not.toBeChecked();
  });

  test('should update accessibility settings', async ({ page }) => {
    // Enable accessibility features
    await page.getByRole('switch', { name: /reduce motion/i }).click();
    await page.getByRole('switch', { name: /high contrast/i }).click();
    
    await page.getByRole('button', { name: /save settings/i }).click();
    await expect(page.locator('[data-testid="settings-effect"]')).toBeVisible();
    
    // Verify settings are enabled
    await expect(page.getByRole('switch', { name: /reduce motion/i })).toBeChecked();
    await expect(page.getByRole('switch', { name: /high contrast/i })).toBeChecked();
  });
}); 