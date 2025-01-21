import { test, expect } from '@playwright/test';
import path from 'path';

const adminAuthFile = path.join(__dirname, '../.auth/admin.json');

test.describe('Admin User Management', () => {
  test.use({ storageState: adminAuthFile });

  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/users');
  });

  test('displays user list with correct columns', async ({ page }) => {
    await expect(page.getByRole('table')).toBeVisible();
    
    // Verify column headers
    const headers = page.getByRole('columnheader');
    await expect(headers.filter({ hasText: 'Codename' })).toBeVisible();
    await expect(headers.filter({ hasText: 'Status' })).toBeVisible();
    await expect(headers.filter({ hasText: 'Clearance Level' })).toBeVisible();
    await expect(headers.filter({ hasText: 'Team' })).toBeVisible();
    await expect(headers.filter({ hasText: 'Last Active' })).toBeVisible();
  });

  test('can search users', async ({ page }) => {
    const searchInput = page.getByRole('searchbox', { name: 'Search users' });
    await searchInput.fill('Superman');
    await expect(page.getByRole('row').filter({ hasText: 'Superman' })).toBeVisible();
  });

  test('can filter users by status', async ({ page }) => {
    const statusFilter = page.getByRole('combobox', { name: 'Filter by status' });
    await statusFilter.click();
    await page.getByRole('option', { name: 'ACTIVE' }).click();
    
    // Verify only active users are shown
    const rows = page.getByRole('row');
    await expect(rows.filter({ hasText: 'INACTIVE' })).toHaveCount(0);
  });

  test('can sort users by different columns', async ({ page }) => {
    // Sort by clearance level
    await page.getByRole('columnheader', { name: 'Clearance Level' }).click();
    
    // Verify sorting (assuming clearance levels are numbers)
    const firstLevel = await page.getByRole('row').nth(1).getByRole('cell').nth(2).textContent();
    const secondLevel = await page.getByRole('row').nth(2).getByRole('cell').nth(2).textContent();
    expect(Number(firstLevel)).toBeLessThanOrEqual(Number(secondLevel));
  });

  test.describe('User Detail View', () => {
    test('can navigate to user detail view', async ({ page }) => {
      await page.getByRole('row').filter({ hasText: 'Superman' }).click();
      await expect(page).toHaveURL(/\/admin\/users\/[^/]+$/);
      await expect(page.getByRole('heading', { name: 'Superman' })).toBeVisible();
    });

    test('displays user profile information', async ({ page }) => {
      await page.getByRole('row').filter({ hasText: 'Superman' }).click();
      
      // Check profile sections
      await expect(page.getByRole('heading', { name: 'Profile Details' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Team Affiliations' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Activity Log' })).toBeVisible();
      
      // Check key information
      await expect(page.getByText('Clearance Level')).toBeVisible();
      await expect(page.getByText('Status')).toBeVisible();
      await expect(page.getByText('Last Active')).toBeVisible();
    });

    test('can edit user status', async ({ page }) => {
      await page.getByRole('row').filter({ hasText: 'Superman' }).click();
      
      // Open status dropdown
      await page.getByRole('button', { name: /ACTIVE|INACTIVE|MIA/ }).click();
      await page.getByRole('option', { name: 'INACTIVE' }).click();
      
      // Check status updated
      await expect(page.getByRole('button', { name: 'INACTIVE' })).toBeVisible();
      await expect(page.getByText('Status updated successfully')).toBeVisible();
    });

    test('can modify clearance level', async ({ page }) => {
      await page.getByRole('row').filter({ hasText: 'Superman' }).click();
      
      // Open clearance level input
      await page.getByRole('button', { name: 'Edit clearance level' }).click();
      await page.getByRole('spinbutton').fill('5');
      await page.getByRole('button', { name: 'Save' }).click();
      
      // Check clearance updated
      await expect(page.getByText('Clearance Level: 5')).toBeVisible();
      await expect(page.getByText('Clearance level updated successfully')).toBeVisible();
    });

    test('can view activity log', async ({ page }) => {
      await page.getByRole('row').filter({ hasText: 'Superman' }).click();
      
      // Check activity log entries
      await expect(page.getByRole('heading', { name: 'Activity Log' })).toBeVisible();
      const logEntries = page.getByRole('listitem');
      await expect(logEntries).toHaveCount(10); // Assuming pagination of 10 items
      await expect(logEntries.first()).toContainText('Last login:');
    });
  });
}); 