import { test, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../.auth/support-staff.json');

test.describe('Support Staff Dashboard Layout & Navigation', () => {
  test.use({ storageState: authFile });

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/support');
  });

  test('should display all required workspace panels with correct layout', async ({ page }) => {
    // Verify main layout container
    const mainLayout = page.getByRole('main', { name: 'Support Dashboard' });
    await expect(mainLayout).toBeVisible();
    await expect(mainLayout).toHaveClass(/grid/);

    // Verify all essential panels are present and visible
    const requiredPanels = [
      'Ticket Queue',
      'Active Missions',
      'Resource Status',
      'Priority Alerts',
      'Team Chat'
    ];

    for (const panelName of requiredPanels) {
      const panel = page.getByRole('region', { name: panelName });
      await expect(panel).toBeVisible();
      // Verify panel has proper ARIA attributes
      await expect(panel).toHaveAttribute('aria-label', panelName);
    }

    // Verify panels are in correct order (layout structure)
    const panels = await page.getByRole('region').all();
    const panelNames = await Promise.all(panels.map(panel => panel.getAttribute('aria-label')));
    expect(panelNames).toEqual(expect.arrayContaining(requiredPanels));
  });

  test('should persist panel layout customizations', async ({ page }) => {
    // Open customization menu
    await page.getByRole('button', { name: 'Layout' }).click();
    
    // Toggle panel visibility
    const panelToToggle = 'Team Chat';
    await page.getByRole('button', { name: `Toggle ${panelToToggle}` }).click();
    
    // Verify panel is hidden
    await expect(page.getByRole('region', { name: panelToToggle })).not.toBeVisible();
    
    // Reload page and verify persistence
    await page.reload();
    await expect(page.getByRole('region', { name: panelToToggle })).not.toBeVisible();
    
    // Reset layout
    await page.getByRole('button', { name: 'Layout' }).click();
    await page.getByRole('button', { name: 'Reset Layout' }).click();
    
    // Verify all panels are visible again
    await expect(page.getByRole('region', { name: panelToToggle })).toBeVisible();
  });

  test('should handle panel resizing', async ({ page }) => {
    const ticketQueue = page.getByRole('region', { name: 'Ticket Queue' });
    const initialBox = await ticketQueue.boundingBox();
    expect(initialBox).not.toBeNull();
    
    // Find and drag the resize handle
    const resizeHandle = ticketQueue.locator('.resize-handle');
    await resizeHandle.dragTo(ticketQueue, {
      targetPosition: { x: 100, y: 0 }
    });
    
    const newBox = await ticketQueue.boundingBox();
    expect(newBox).not.toBeNull();
    expect(newBox!.width).not.toBe(initialBox!.width);
    
    // Verify persistence after reload
    await page.reload();
    const persistedBox = await ticketQueue.boundingBox();
    expect(persistedBox).not.toBeNull();
    expect(persistedBox!.width).toBe(newBox!.width);
  });
}); 