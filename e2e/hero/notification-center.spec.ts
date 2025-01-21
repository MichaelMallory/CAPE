import { test, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../.auth/hero.json');

test.describe('Notification Center', () => {
  test.use({ storageState: authFile });

  test.beforeEach(async ({ page }) => {
    await page.goto('/hero/dashboard');
  });

  test('should display notifications with different priorities', async ({ page }) => {
    // Open notification center
    await page.getByRole('button', { name: 'Notifications' }).click();
    
    // Check notification categories
    await expect(page.getByRole('tab', { name: 'All' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Missions' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Equipment' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Intelligence' })).toBeVisible();

    // Verify priority indicators
    await expect(page.getByRole('status', { name: 'OMEGA Priority' })).toHaveClass(/bg-red-500/);
    await expect(page.getByRole('status', { name: 'ALPHA Priority' })).toHaveClass(/bg-orange-500/);
  });

  test('should mark notifications as read', async ({ page }) => {
    await page.getByRole('button', { name: 'Notifications' }).click();
    
    // Get initial unread count
    const initialCount = await page.getByTestId('unread-count').textContent();
    
    // Mark notification as read
    await page.getByRole('button', { name: 'Mark as read' }).first().click();
    
    // Verify count decreased
    await expect(page.getByTestId('unread-count')).not.toHaveText(initialCount);
    
    // Mark all as read
    await page.getByRole('button', { name: 'Mark all as read' }).click();
    await expect(page.getByTestId('unread-count')).toHaveText('0');
  });

  test('should filter notifications by category', async ({ page }) => {
    await page.getByRole('button', { name: 'Notifications' }).click();
    
    // Switch to missions tab
    await page.getByRole('tab', { name: 'Missions' }).click();
    await expect(page.getByRole('tabpanel')).toContainText('Mission Update');
    
    // Switch to equipment tab
    await page.getByRole('tab', { name: 'Equipment' }).click();
    await expect(page.getByRole('tabpanel')).toContainText('Maintenance Alert');
  });

  test('should navigate to related content', async ({ page }) => {
    await page.getByRole('button', { name: 'Notifications' }).click();
    
    // Click on mission notification
    await page.getByRole('link', { name: /Mission Update/ }).click();
    await expect(page).toHaveURL(/\/hero\/missions\/[\w-]+$/);
    
    // Go back and click equipment notification
    await page.goBack();
    await page.getByRole('button', { name: 'Notifications' }).click();
    await page.getByRole('link', { name: /Maintenance Alert/ }).click();
    await expect(page).toHaveURL(/\/hero\/equipment\/[\w-]+$/);
  });

  test('should show real-time updates', async ({ page }) => {
    await page.getByRole('button', { name: 'Notifications' }).click();
    
    // Wait for new notification
    const newNotification = page.getByRole('listitem').first();
    await expect(newNotification).toContainText('Just now');
    await expect(newNotification).toHaveClass(/animate-highlight/);
  });
}); 