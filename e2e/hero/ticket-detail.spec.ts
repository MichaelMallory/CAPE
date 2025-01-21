import { test, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../.auth/hero.json');

test.describe('Ticket Detail View', () => {
  test.use({ storageState: authFile });

  test.beforeEach(async ({ page }) => {
    // Navigate to a specific ticket detail page
    await page.goto('/hero/tickets/test-ticket-id');
  });

  test('should display ticket header information', async ({ page }) => {
    // Check ticket title and metadata
    await expect(page.getByRole('heading', { name: 'Equipment Malfunction' })).toBeVisible();
    await expect(page.getByText('BETA Priority')).toBeVisible();
    await expect(page.getByText('Equipment')).toBeVisible();
    await expect(page.getByText('Created')).toBeVisible();
    await expect(page.getByText('Last Updated')).toBeVisible();

    // Check status badge
    await expect(page.getByRole('status')).toHaveText('IN PROGRESS');
    await expect(page.getByRole('status')).toHaveClass(/bg-yellow-500/);
  });

  test('should show status timeline', async ({ page }) => {
    // Check timeline entries
    await expect(page.getByTestId('timeline')).toBeVisible();
    await expect(page.getByRole('listitem')).toHaveCount(3); // Assuming 3 status updates

    // Verify timeline entry content
    const firstEntry = page.getByRole('listitem').first();
    await expect(firstEntry).toContainText('Status changed to IN PROGRESS');
    await expect(firstEntry).toContainText('by Iron Man');
    await expect(firstEntry).toContainText(/\d+ minutes ago/);
  });

  test('should support commenting system', async ({ page }) => {
    // Add a new comment
    await page.getByRole('textbox', { name: 'Add comment' }).fill('Testing the equipment now');
    await page.getByRole('button', { name: 'Post comment' }).click();

    // Verify comment appears
    await expect(page.getByRole('article').first()).toContainText('Testing the equipment now');
    await expect(page.getByRole('article').first()).toContainText('Just now');

    // Test comment actions
    await page.getByRole('button', { name: 'Edit comment' }).first().click();
    await page.getByRole('textbox', { name: 'Edit comment' }).fill('Updated test comment');
    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByRole('article').first()).toContainText('Updated test comment');
  });

  test('should have functional action sidebar', async ({ page }) => {
    // Test status update
    await page.getByRole('button', { name: 'Update Status' }).click();
    await page.getByRole('option', { name: 'Resolved' }).click();
    await expect(page.getByRole('status')).toHaveText('RESOLVED');

    // Test priority update
    await page.getByRole('button', { name: 'Update Priority' }).click();
    await page.getByRole('option', { name: 'ALPHA' }).click();
    await expect(page.getByText('ALPHA Priority')).toBeVisible();

    // Test assignment
    await page.getByRole('button', { name: 'Assign Ticket' }).click();
    await page.getByRole('searchbox', { name: 'Search heroes' }).fill('Spider');
    await page.getByRole('option', { name: 'Spider-Man' }).click();
    await expect(page.getByText('Assigned to Spider-Man')).toBeVisible();
  });

  test('should display related tickets', async ({ page }) => {
    // Check related tickets section
    await expect(page.getByRole('region', { name: 'Related Tickets' })).toBeVisible();
    
    // Verify related ticket links
    const relatedTickets = page.getByTestId('related-ticket');
    await expect(relatedTickets).toHaveCount(3); // Assuming 3 related tickets
    
    // Click on a related ticket
    await relatedTickets.first().click();
    await expect(page).toHaveURL(/\/hero\/tickets\/[\w-]+$/);
  });
}); 