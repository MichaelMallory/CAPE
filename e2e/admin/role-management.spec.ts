import { test, expect } from '@playwright/test';
import path from 'path';

const adminAuthFile = path.join(__dirname, '../.auth/admin.json');

test.describe('Role Management', () => {
  test.use({ storageState: adminAuthFile });

  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/roles');
  });

  test('displays role list with correct columns', async ({ page }) => {
    await expect(page.getByRole('table')).toBeVisible();
    
    // Verify column headers
    const headers = page.getByRole('columnheader');
    await expect(headers.filter({ hasText: 'Role Name' })).toBeVisible();
    await expect(headers.filter({ hasText: 'Description' })).toBeVisible();
    await expect(headers.filter({ hasText: 'Permissions' })).toBeVisible();
    await expect(headers.filter({ hasText: 'Members' })).toBeVisible();
    await expect(headers.filter({ hasText: 'Last Modified' })).toBeVisible();
  });

  test('can create a new role', async ({ page }) => {
    // Click create role button
    await page.getByRole('button', { name: 'Create Role' }).click();
    
    // Fill role details
    await page.getByLabel('Role Name').fill('Field Commander');
    await page.getByLabel('Description').fill('Leads field operations and coordinates team responses');
    
    // Select permissions
    await page.getByRole('button', { name: 'Select permissions' }).click();
    await page.getByRole('option', { name: 'View Missions' }).click();
    await page.getByRole('option', { name: 'Assign Teams' }).click();
    await page.getByRole('option', { name: 'Manage Equipment' }).click();
    await page.getByRole('button', { name: 'Done' }).click();
    
    // Save role
    await page.getByRole('button', { name: 'Save Role' }).click();
    
    // Verify role was created
    await expect(page.getByRole('cell', { name: 'Field Commander' })).toBeVisible();
    await expect(page.getByText('Role created successfully')).toBeVisible();
  });

  test('can edit role permissions', async ({ page }) => {
    // Click on existing role
    await page.getByRole('row', { name: /Field Commander/ }).click();
    
    // Edit permissions
    await page.getByRole('button', { name: 'Edit Permissions' }).click();
    await page.getByRole('option', { name: 'Approve Missions' }).click();
    await page.getByRole('button', { name: 'Save Changes' }).click();
    
    // Verify changes
    await expect(page.getByText('Permissions updated successfully')).toBeVisible();
    await expect(page.getByText('Approve Missions')).toBeVisible();
  });

  test('can assign users to role', async ({ page }) => {
    // Click on existing role
    await page.getByRole('row', { name: /Field Commander/ }).click();
    
    // Open assign users modal
    await page.getByRole('button', { name: 'Assign Users' }).click();
    
    // Select users
    await page.getByRole('searchbox', { name: 'Search users' }).fill('Superman');
    await page.getByRole('checkbox', { name: 'Superman' }).check();
    await page.getByRole('button', { name: 'Save Assignments' }).click();
    
    // Verify assignment
    await expect(page.getByText('Users assigned successfully')).toBeVisible();
    await expect(page.getByText('Superman')).toBeVisible();
  });

  test('can delete role', async ({ page }) => {
    // Find and click delete button for a role
    await page.getByRole('row', { name: /Field Commander/ })
      .getByRole('button', { name: 'Delete' })
      .click();
    
    // Confirm deletion
    await page.getByRole('button', { name: 'Confirm Delete' }).click();
    
    // Verify role was deleted
    await expect(page.getByRole('row', { name: /Field Commander/ })).not.toBeVisible();
    await expect(page.getByText('Role deleted successfully')).toBeVisible();
  });
}); 