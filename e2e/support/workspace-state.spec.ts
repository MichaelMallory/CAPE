import { test, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../.auth/support-staff.json');

test.describe('Workspace State Management', () => {
  test.use({ storageState: authFile });

  test.beforeEach(async ({ page }) => {
    await page.goto('/support/dashboard');
  });

  test('should persist workspace state', async ({ page, context }) => {
    // Save initial workspace state
    await page.getByRole('button', { name: 'Save Layout' }).click();
    await expect(page.getByText('Layout saved successfully')).toBeVisible();

    // Modify layout
    const ticketQueue = page.getByRole('region', { name: 'Ticket Queue' });
    await ticketQueue.dragTo(page.getByTestId('grid-cell-2-2'));
    await page.getByRole('button', { name: 'Save Layout' }).click();

    // Reload page to verify persistence
    await page.reload();
    await expect(page.getByRole('region', { name: 'Ticket Queue' }))
      .toHaveAttribute('data-grid-position', '2-2');
  });

  test('should sync state across tabs in real-time', async ({ page, context }) => {
    // Open dashboard in two tabs
    const secondPage = await context.newPage();
    await secondPage.goto('/support/dashboard');

    // Make changes in first tab
    await page.getByRole('button', { name: 'Toggle Resource Panel' }).click();
    await page.getByRole('button', { name: 'Save Layout' }).click();

    // Changes should be reflected immediately in second tab via Supabase realtime
    await expect(secondPage.getByRole('region', { name: 'Resource Status' }))
      .toHaveAttribute('data-visibility', 'hidden');
  });

  test('should handle concurrent edits correctly', async ({ page, context }) => {
    // Open dashboard in two tabs
    const secondPage = await context.newPage();
    await secondPage.goto('/support/dashboard');

    // Make changes in both tabs simultaneously
    await Promise.all([
      page.getByRole('button', { name: 'Toggle Resource Panel' }).click(),
      secondPage.getByRole('button', { name: 'Toggle Ticket Queue' }).click()
    ]);

    await Promise.all([
      page.getByRole('button', { name: 'Save Layout' }).click(),
      secondPage.getByRole('button', { name: 'Save Layout' }).click()
    ]);

    // Both changes should be reflected in both tabs
    for (const p of [page, secondPage]) {
      await expect(p.getByRole('region', { name: 'Resource Status' }))
        .toHaveAttribute('data-visibility', 'hidden');
      await expect(p.getByRole('region', { name: 'Ticket Queue' }))
        .toHaveAttribute('data-visibility', 'hidden');
    }
  });

  test('should handle offline changes', async ({ page }) => {
    // Disable network to simulate offline
    await page.route('**', route => route.abort());

    // Try to save layout while offline
    const ticketQueue = page.getByRole('region', { name: 'Ticket Queue' });
    await ticketQueue.dragTo(page.getByTestId('grid-cell-2-2'));
    await page.getByRole('button', { name: 'Save Layout' }).click();

    // Should show offline indicator
    await expect(page.getByText('Changes saved locally')).toBeVisible();

    // Re-enable network
    await page.unroute('**');

    // Changes should sync automatically
    await expect(page.getByText('Changes synced')).toBeVisible();
  });
}); 