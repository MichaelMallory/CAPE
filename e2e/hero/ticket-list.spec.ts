import { test, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../.auth/hero.json');

test.describe('Ticket List View', () => {
  test.use({ storageState: authFile });

  test.beforeEach(async ({ page }) => {
    await page.goto('/hero/tickets');
  });

  test('should display ticket list with filtering and sorting', async ({ page }) => {
    // Test search functionality
    await page.getByRole('searchbox', { name: 'Search tickets' }).fill('equipment');
    await expect(page.getByRole('row')).toHaveCount(2); // Assuming 2 equipment-related tickets

    // Test category filter
    await page.getByRole('button', { name: 'Filter by category' }).click();
    await page.getByRole('option', { name: 'Equipment' }).click();
    await expect(page.getByRole('row')).toHaveCount(3);

    // Test priority filter
    await page.getByRole('button', { name: 'Filter by priority' }).click();
    await page.getByRole('option', { name: 'ALPHA' }).click();
    await expect(page.getByRole('row')).toHaveCount(1);

    // Test sorting
    await page.getByRole('button', { name: 'Sort by Created' }).click();
    await expect(page.getByRole('row').first()).toContainText('Latest Ticket');
    await page.getByRole('button', { name: 'Sort by Created' }).click();
    await expect(page.getByRole('row').first()).toContainText('Oldest Ticket');
  });

  test('should support bulk actions', async ({ page }) => {
    // Select multiple tickets
    await page.getByRole('checkbox', { name: 'Select ticket 1' }).check();
    await page.getByRole('checkbox', { name: 'Select ticket 2' }).check();
    
    // Test bulk status update
    await page.getByRole('button', { name: 'Bulk actions' }).click();
    await page.getByRole('menuitem', { name: 'Mark as resolved' }).click();
    await expect(page.getByText('2 tickets updated')).toBeVisible();
    
    // Verify status update
    await expect(page.getByRole('cell', { name: 'Resolved' })).toHaveCount(2);
  });

  test('should handle pagination', async ({ page }) => {
    // Navigate through pages
    await expect(page.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page');
    await page.getByRole('button', { name: 'Next page' }).click();
    await expect(page.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
    
    // Change items per page
    await page.getByRole('combobox', { name: 'Items per page' }).click();
    await page.getByRole('option', { name: '25 items' }).click();
    await expect(page.getByRole('row')).toHaveCount(26); // 25 items + header row
  });

  test('should allow quick actions from list view', async ({ page }) => {
    // Test quick status update
    await page.getByRole('button', { name: 'Update status of ticket 1' }).click();
    await page.getByRole('menuitem', { name: 'In Progress' }).click();
    await expect(page.getByRole('cell', { name: 'In Progress' }).first()).toBeVisible();
    
    // Test quick priority update
    await page.getByRole('button', { name: 'Update priority of ticket 1' }).click();
    await page.getByRole('menuitem', { name: 'ALPHA' }).click();
    await expect(page.getByRole('cell', { name: 'ALPHA' }).first()).toBeVisible();
  });

  test('should navigate to ticket detail view', async ({ page }) => {
    await page.getByRole('link', { name: 'Equipment Malfunction' }).click();
    await expect(page).toHaveURL(/\/hero\/tickets\/[\w-]+$/);
    await expect(page.getByRole('heading')).toContainText('Equipment Malfunction');
  });
}); 