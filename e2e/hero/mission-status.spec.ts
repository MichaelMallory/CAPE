import { test, expect } from '@playwright/test';

test.describe('Mission Status Cards', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to hero dashboard
    await page.goto('/hero/dashboard');
  });

  test('should display mission status cards with correct information', async ({ page }) => {
    // Check for mission status section
    const statusSection = await page.getByRole('region', { name: /mission status/i });
    await expect(statusSection).toBeVisible();

    // Verify card components exist
    const cards = await statusSection.getByRole('article');
    await expect(cards).toHaveCount(3); // Assuming we show 3 most recent/important missions

    // Check first card content
    const firstCard = cards.first();
    await expect(firstCard.getByRole('heading')).toBeVisible(); // Mission name
    await expect(firstCard.getByRole('status')).toBeVisible(); // Mission status badge
    await expect(firstCard.getByRole('meter')).toBeVisible(); // Progress indicator
    await expect(firstCard.getByRole('button', { name: /view details/i })).toBeVisible();
  });

  test('should navigate to mission details when clicking view details', async ({ page }) => {
    const firstCard = await page.getByRole('region', { name: /mission status/i })
      .getByRole('article')
      .first();
    
    // Click view details and verify navigation
    await firstCard.getByRole('button', { name: /view details/i }).click();
    await expect(page).toHaveURL(/\/missions\/[\w-]+/);
  });

  test('should update mission status in real-time', async ({ page }) => {
    const firstCard = await page.getByRole('region', { name: /mission status/i })
      .getByRole('article')
      .first();
    
    // Wait for and get initial status
    const statusElement = firstCard.getByRole('status');
    await expect(statusElement).toBeVisible();
    const initialStatus = await statusElement.textContent();
    expect(initialStatus).not.toBeNull();
    
    // Trigger a status update (this would be done through the backend in reality)
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('mission-update', {
        detail: {
          id: '1',
          status: 'IN_PROGRESS'
        }
      }));
    });

    // Verify status was updated
    await expect(statusElement).not.toHaveText(initialStatus!);
    await expect(statusElement).toHaveText(/in progress/i);
  });
}); 