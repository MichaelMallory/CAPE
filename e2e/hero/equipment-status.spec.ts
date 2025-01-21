import { test, expect } from '@playwright/test';

test.describe('Equipment Status', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to hero dashboard
    await page.goto('/hero/dashboard');
  });

  test('should display equipment status cards with correct information', async ({ page }) => {
    // Check for equipment status section
    const statusSection = await page.getByRole('region', { name: /equipment status/i });
    await expect(statusSection).toBeVisible();

    // Verify card components exist
    const cards = await statusSection.getByRole('article');
    await expect(cards.first()).toBeVisible();

    // Check first card content
    const firstCard = cards.first();
    await expect(firstCard.getByRole('heading')).toBeVisible(); // Equipment name
    await expect(firstCard.getByRole('status')).toBeVisible(); // Status badge
    await expect(firstCard.getByRole('meter')).toBeVisible(); // Durability indicator
    await expect(firstCard.getByRole('button', { name: /request maintenance/i })).toBeVisible();
  });

  test('should show maintenance request form when clicking request button', async ({ page }) => {
    const firstCard = await page.getByRole('region', { name: /equipment status/i })
      .getByRole('article')
      .first();
    
    // Click request maintenance and verify form appears
    await firstCard.getByRole('button', { name: /request maintenance/i }).click();
    
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading')).toHaveText(/maintenance request/i);
    
    // Check form fields
    await expect(dialog.getByRole('textbox', { name: /description/i })).toBeVisible();
    await expect(dialog.getByRole('combobox', { name: /urgency/i })).toBeVisible();
    await expect(dialog.getByRole('button', { name: /submit/i })).toBeVisible();
  });

  test('should update equipment status in real-time', async ({ page }) => {
    const firstCard = await page.getByRole('region', { name: /equipment status/i })
      .getByRole('article')
      .first();
    
    // Wait for and get initial status
    const statusElement = firstCard.getByRole('status');
    await expect(statusElement).toBeVisible();
    const initialStatus = await statusElement.textContent();
    expect(initialStatus).not.toBeNull();
    
    // Trigger a status update (this would be done through the backend in reality)
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('equipment-update', {
        detail: {
          id: '1',
          status: 'MAINTENANCE_REQUIRED'
        }
      }));
    });

    // Verify status was updated
    await expect(statusElement).not.toHaveText(initialStatus!);
    await expect(statusElement).toHaveText(/maintenance required/i);
  });

  test('should show equipment details when clicking info button', async ({ page }) => {
    const firstCard = await page.getByRole('region', { name: /equipment status/i })
      .getByRole('article')
      .first();
    
    // Click info button and verify details sheet appears
    await firstCard.getByRole('button', { name: /view details/i }).click();
    
    const sheet = page.getByRole('complementary', { name: /equipment details/i });
    await expect(sheet).toBeVisible();
    
    // Check details content
    await expect(sheet.getByRole('heading', { name: /specifications/i })).toBeVisible();
    await expect(sheet.getByRole('heading', { name: /maintenance history/i })).toBeVisible();
    await expect(sheet.getByRole('table')).toBeVisible(); // Maintenance history table
  });
}); 