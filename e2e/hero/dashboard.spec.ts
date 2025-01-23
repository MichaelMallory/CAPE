import { test, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../setup/hero-auth.json');

test.describe('Hero Dashboard', () => {
  test.use({ storageState: authFile });

  test.beforeEach(async ({ page }) => {
    // Add error handling and wait for network idle
    await page.goto('/dashboard/hero', { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');
  });

  test('should display all default panels', async ({ page }) => {
    // Check main heading
    await expect(page.getByRole('heading', { name: 'Hero Dashboard', level: 1 }))
      .toBeVisible();

    // Verify all default panels are visible
    const expectedPanels = [
      'Mission Status',
      'Equipment Status',
      'Alert Center',
      'Quick Actions',
      'Activity Feed'
    ];

    for (const panelTitle of expectedPanels) {
      await expect(page.getByRole('heading', { name: panelTitle }))
        .toBeVisible();
    }
  });

  test('should allow customizing dashboard layout', async ({ page }) => {
    // Find and click the settings gear icon button
    const settingsButton = page.locator('button[aria-label="Customize Dashboard"]');
    await expect(settingsButton).toBeVisible();
    await settingsButton.click();
    
    // Verify customization panel appears
    const customizeHeading = page.getByText('Customize Dashboard', { exact: true });
    await expect(customizeHeading).toBeVisible();

    // Verify all panel toggles are present and interactive
    const expectedPanels = [
      'Mission Status',
      'Equipment Status',
      'Alert Center',
      'Quick Actions',
      'Activity Feed'
    ];

    // Test toggling each panel
    for (const panelTitle of expectedPanels) {
      // Find the toggle for this panel
      const toggle = page.getByLabel(`Show ${panelTitle}`);
      await expect(toggle).toBeVisible();
      
      // Toggle it off
      await toggle.click();
      
      // Verify the panel is hidden
      await expect(page.getByRole('heading', { name: panelTitle })).not.toBeVisible();
      
      // Toggle it back on
      await toggle.click();
      
      // Verify the panel is visible again
      await expect(page.getByRole('heading', { name: panelTitle })).toBeVisible();
    }

    // Test the reset layout functionality
    const resetButton = page.getByRole('button', { name: 'Reset Layout' });
    await expect(resetButton).toBeVisible();
    await resetButton.click();

    // Verify all panels are visible after reset
    for (const panelTitle of expectedPanels) {
      await expect(page.getByRole('heading', { name: panelTitle })).toBeVisible();
    }
  });
}); 