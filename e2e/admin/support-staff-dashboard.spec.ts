import { test, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../.auth/support-staff.json');

test.describe('Support Staff Dashboard', () => {
  test.use({ storageState: authFile });

  test.beforeEach(async ({ page }) => {
    await page.goto('/support/dashboard');
  });

  test('should display all required workspace panels', async ({ page }) => {
    // Verify main layout sections are present
    await expect(page.getByRole('region', { name: 'Ticket Queue' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Active Missions' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Resource Status' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Priority Alerts' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Team Chat' })).toBeVisible();

    // Verify panels are draggable
    const ticketPanel = page.getByRole('region', { name: 'Ticket Queue' });
    await expect(ticketPanel).toHaveAttribute('draggable', 'true');
  });

  test('should persist panel layout changes', async ({ page }) => {
    // Save initial layout positions
    const ticketPanel = page.getByRole('region', { name: 'Ticket Queue' });
    const initialRect = await ticketPanel.boundingBox();

    // Trigger drag and drop (simulated via layout change)
    await page.evaluate(() => {
      // Simulate layout change via localStorage
      localStorage.setItem('support-dashboard-layout', JSON.stringify({
        'ticket-queue': { x: 100, y: 100 }
      }));
    });

    // Refresh page
    await page.reload();

    // Verify new position is maintained
    const newRect = await ticketPanel.boundingBox();
    expect(newRect).not.toEqual(initialRect);
  });

  test('should toggle panel visibility using tool palette', async ({ page }) => {
    // Open tool palette
    await page.getByRole('button', { name: 'Layout' }).click();

    // Toggle ticket queue visibility
    await page.getByRole('button', { name: 'Toggle Ticket Queue' }).click();
    await expect(page.getByRole('region', { name: 'Ticket Queue' })).not.toBeVisible();

    // Toggle it back
    await page.getByRole('button', { name: 'Toggle Ticket Queue' }).click();
    await expect(page.getByRole('region', { name: 'Ticket Queue' })).toBeVisible();
  });

  test('should reset layout to default', async ({ page }) => {
    // Open tool palette
    await page.getByRole('button', { name: 'Layout' }).click();

    // Hide some panels
    await page.getByRole('button', { name: 'Toggle Ticket Queue' }).click();
    await page.getByRole('button', { name: 'Toggle Active Missions' }).click();

    // Reset layout
    await page.getByRole('button', { name: 'Reset Layout' }).click();

    // Verify all panels are visible
    await expect(page.getByRole('region', { name: 'Ticket Queue' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Active Missions' })).toBeVisible();
  });

  test('should toggle gridlines', async ({ page }) => {
    // Open tool palette
    await page.getByRole('button', { name: 'Layout' }).click();

    // Get the grid container
    const gridContainer = page.locator('.grid');

    // Toggle gridlines off
    await page.getByRole('button', { name: 'Toggle Gridlines' }).click();
    await expect(gridContainer).toHaveCSS('background-image', 'none');

    // Toggle gridlines on
    await page.getByRole('button', { name: 'Toggle Gridlines' }).click();
    await expect(gridContainer).toHaveCSS('background-image', /url.*grid-pattern\.svg/);
  });
}); 