import { test, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../.auth/support-staff.json');

test.describe('Workspace API', () => {
  test.use({ storageState: authFile });

  test.beforeEach(async ({ page }) => {
    await page.goto('/support/dashboard');
  });

  test('should persist workspace state across sessions', async ({ page, context }) => {
    // Save initial workspace state
    await page.getByRole('button', { name: 'Save Layout' }).click();
    await expect(page.getByText('Layout saved successfully')).toBeVisible();

    // Modify layout
    const ticketQueue = page.getByRole('region', { name: 'Ticket Queue' });
    await ticketQueue.dragTo(page.getByTestId('grid-cell-2-2'));
    await page.getByRole('button', { name: 'Save Layout' }).click();

    // Create new context to simulate new session
    const newContext = await context.browser().newContext({ storageState: authFile });
    const newPage = await newContext.newPage();
    await newPage.goto('/support/dashboard');

    // Verify layout persisted
    await expect(newPage.getByRole('region', { name: 'Ticket Queue' }))
      .toHaveAttribute('data-grid-position', '2-2');
  });

  test('should synchronize workspace state across tabs', async ({ page, context }) => {
    // Open dashboard in two tabs
    const secondPage = await context.newPage();
    await secondPage.goto('/support/dashboard');

    // Make changes in first tab
    await page.getByRole('button', { name: 'Toggle Resource Panel' }).click();
    await page.getByRole('button', { name: 'Save Layout' }).click();

    // Verify changes reflected in second tab
    await expect(secondPage.getByRole('region', { name: 'Resource Status' }))
      .toHaveAttribute('data-visibility', 'hidden');
  });

  test('should backup and restore workspace state', async ({ page }) => {
    // Create custom layout
    const resourcePanel = page.getByRole('region', { name: 'Resource Status' });
    await resourcePanel.dragTo(page.getByTestId('grid-cell-1-1'));
    await page.getByRole('button', { name: 'Save Layout' }).click();

    // Trigger backup
    await page.getByRole('button', { name: 'Backup Layout' }).click();
    await expect(page.getByText('Layout backed up successfully')).toBeVisible();

    // Reset to default
    await page.getByRole('button', { name: 'Reset Layout' }).click();
    await expect(resourcePanel).not.toHaveAttribute('data-grid-position', '1-1');

    // Restore from backup
    await page.getByRole('button', { name: 'Restore Layout' }).click();
    await expect(resourcePanel).toHaveAttribute('data-grid-position', '1-1');
  });

  test('should handle workspace recovery after errors', async ({ page }) => {
    // Simulate corrupted state
    await page.evaluate(() => {
      localStorage.setItem('workspace_layout', 'invalid_json');
    });
    await page.reload();

    // Verify fallback to default layout
    await expect(page.getByRole('region', { name: 'Ticket Queue' }))
      .toHaveAttribute('data-grid-position', '1-1');
    await expect(page.getByText('Layout restored to default')).toBeVisible();
  });
}); 