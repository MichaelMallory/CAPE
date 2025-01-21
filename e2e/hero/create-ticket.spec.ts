import { test, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../.auth/hero.json');

test.describe('Ticket Creation Interface', () => {
  test.use({ storageState: authFile });

  test.beforeEach(async ({ page }) => {
    await page.goto('/hero/tickets/new');
  });

  test('should create a basic support ticket', async ({ page }) => {
    // Fill out ticket form
    await page.getByRole('textbox', { name: 'Title' }).fill('Equipment Malfunction');
    await page.getByRole('combobox', { name: 'Category' }).click();
    await page.getByRole('option', { name: 'Equipment' }).click();
    await page.getByRole('combobox', { name: 'Priority' }).click();
    await page.getByRole('option', { name: 'BETA' }).click();
    await page.getByRole('textbox', { name: 'Description' }).fill('My grappling hook is malfunctioning');
    
    // Submit form
    await page.getByRole('button', { name: 'Submit Ticket' }).click();
    
    // Verify success message
    await expect(page.getByText('Ticket created successfully')).toBeVisible();
    
    // Verify redirect to ticket detail
    await expect(page).toHaveURL(/\/hero\/tickets\/[\w-]+$/);
  });

  test('should support file attachments', async ({ page }) => {
    await page.getByLabel('Attach Files').setInputFiles([
      path.join(__dirname, '../fixtures/test-image.jpg')
    ]);
    
    await expect(page.getByText('test-image.jpg')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Remove' })).toBeVisible();
  });

  test('should require mandatory fields', async ({ page }) => {
    // Try to submit without required fields
    await page.getByRole('button', { name: 'Submit Ticket' }).click();
    
    // Verify error messages
    await expect(page.getByText('Title is required')).toBeVisible();
    await expect(page.getByText('Category is required')).toBeVisible();
    await expect(page.getByText('Priority is required')).toBeVisible();
    await expect(page.getByText('Description is required')).toBeVisible();
  });

  test('should support location selection', async ({ page }) => {
    await page.getByRole('button', { name: 'Select Location' }).click();
    await page.getByRole('button', { name: 'Set Current Location' }).click();
    
    await expect(page.getByText('Location selected')).toBeVisible();
    await expect(page.getByRole('img', { name: 'Map preview' })).toBeVisible();
  });
}); 