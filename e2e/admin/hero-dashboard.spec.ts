import { test, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../.auth/hero.json');

test.describe('Hero Dashboard', () => {
  test.use({ storageState: authFile });

  test.beforeEach(async ({ page }) => {
    await page.goto('/hero/dashboard');
  });

  test('should display comic panel grid layout', async ({ page }) => {
    // Verify main grid container
    const grid = page.getByRole('main', { name: 'Hero Dashboard' });
    await expect(grid).toBeVisible();
    await expect(grid).toHaveClass(/grid/);

    // Verify essential panels are present
    await expect(page.getByRole('region', { name: 'Current Mission' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Equipment Status' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Alert Center' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Activity Timeline' })).toBeVisible();
  });

  test('should be responsive to different screen sizes', async ({ page }) => {
    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    const mobileGrid = page.getByRole('main', { name: 'Hero Dashboard' });
    await expect(mobileGrid).toHaveClass(/mobile/);
    
    // Test tablet layout
    await page.setViewportSize({ width: 768, height: 1024 });
    const tabletGrid = page.getByRole('main', { name: 'Hero Dashboard' });
    await expect(tabletGrid).toHaveClass(/tablet/);
    
    // Test desktop layout
    await page.setViewportSize({ width: 1440, height: 900 });
    const desktopGrid = page.getByRole('main', { name: 'Hero Dashboard' });
    await expect(desktopGrid).toHaveClass(/desktop/);
  });

  test('should allow widget customization', async ({ page }) => {
    // Open customization menu
    await page.getByRole('button', { name: 'Customize Dashboard' }).click();
    
    // Toggle widget visibility
    const equipmentToggle = page.getByRole('switch', { name: 'Show Equipment Status' });
    await equipmentToggle.click();
    await expect(page.getByRole('region', { name: 'Equipment Status' })).not.toBeVisible();
    
    // Verify persistence after reload
    await page.reload();
    await expect(page.getByRole('region', { name: 'Equipment Status' })).not.toBeVisible();
    
    // Reset customization
    await page.getByRole('button', { name: 'Reset Layout' }).click();
    await expect(page.getByRole('region', { name: 'Equipment Status' })).toBeVisible();
  });

  test('should support widget system with drag and drop', async ({ page }) => {
    // Start dragging a widget
    const missionPanel = page.getByRole('region', { name: 'Current Mission' });
    const alertPanel = page.getByRole('region', { name: 'Alert Center' });
    
    // Get initial positions
    const initialMissionBox = await missionPanel.boundingBox();
    const initialAlertBox = await alertPanel.boundingBox();
    
    // Perform drag and drop
    await missionPanel.dragTo(alertPanel);
    
    // Verify positions have changed
    const finalMissionBox = await missionPanel.boundingBox();
    const finalAlertBox = await alertPanel.boundingBox();
    
    expect(finalMissionBox).not.toEqual(initialMissionBox);
    expect(finalAlertBox).not.toEqual(initialAlertBox);
    
    // Verify persistence after reload
    await page.reload();
    const reloadedMissionBox = await missionPanel.boundingBox();
    expect(reloadedMissionBox).toEqual(finalMissionBox);
  });
}); 