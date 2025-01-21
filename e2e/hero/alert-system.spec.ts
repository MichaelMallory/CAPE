import { test, expect } from '@playwright/test';

test.describe('Alert System', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to hero dashboard
    await page.goto('/hero/dashboard');
  });

  test('should display alert center with correct information', async ({ page }) => {
    // Check for alert center section
    const alertSection = await page.getByRole('region', { name: /alert center/i });
    await expect(alertSection).toBeVisible();

    // Verify alert list exists
    const alerts = await alertSection.getByRole('listitem');
    await expect(alerts.first()).toBeVisible();

    // Check first alert content
    const firstAlert = alerts.first();
    await expect(firstAlert.getByRole('heading')).toBeVisible(); // Alert title
    await expect(firstAlert.getByRole('status')).toBeVisible(); // Priority badge
    await expect(firstAlert.getByRole('time')).toBeVisible(); // Timestamp
    await expect(firstAlert.getByRole('button', { name: /acknowledge/i })).toBeVisible();
  });

  test('should filter alerts by priority', async ({ page }) => {
    const alertSection = await page.getByRole('region', { name: /alert center/i });
    
    // Open filter menu
    await alertSection.getByRole('button', { name: /filter/i }).click();
    
    // Select OMEGA priority
    await page.getByRole('menuitemcheckbox', { name: /omega/i }).click();
    
    // Verify only OMEGA alerts are shown
    const alerts = await alertSection.getByRole('listitem').all();
    for (const alert of alerts) {
      await expect(alert.getByRole('status')).toHaveText(/omega/i);
    }
  });

  test('should acknowledge alert and remove from active list', async ({ page }) => {
    const alertSection = await page.getByRole('region', { name: /alert center/i });
    const firstAlert = alertSection.getByRole('listitem').first();
    
    // Get initial alert count
    const initialAlerts = await alertSection.getByRole('listitem').count();
    
    // Get alert ID for verification
    const alertId = await firstAlert.getAttribute('data-alert-id');
    expect(alertId).not.toBeNull();
    
    // Acknowledge alert
    await firstAlert.getByRole('button', { name: /acknowledge/i }).click();
    
    // Verify alert was removed
    await expect(alertSection.getByRole('listitem')).toHaveCount(initialAlerts - 1);
    await expect(page.getByTestId(`alert-${alertId}`)).not.toBeVisible();
  });

  test('should show alert details in modal', async ({ page }) => {
    const alertSection = await page.getByRole('region', { name: /alert center/i });
    const firstAlert = alertSection.getByRole('listitem').first();
    
    // Click alert to show details
    await firstAlert.click();
    
    // Verify details modal
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await expect(modal.getByRole('heading', { name: /alert details/i })).toBeVisible();
    
    // Check content sections
    await expect(modal.getByRole('heading', { name: /description/i })).toBeVisible();
    await expect(modal.getByRole('heading', { name: /affected areas/i })).toBeVisible();
    await expect(modal.getByRole('heading', { name: /recommended actions/i })).toBeVisible();
  });

  test('should update alerts in real-time', async ({ page }) => {
    const alertSection = await page.getByRole('region', { name: /alert center/i });
    
    // Get initial alert count
    const initialCount = await alertSection.getByRole('listitem').count();
    
    // Trigger a new alert (this would be done through the backend in reality)
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('new-alert', {
        detail: {
          id: 'test-alert',
          title: 'Test Alert',
          priority: 'OMEGA',
          timestamp: new Date().toISOString(),
          description: 'Test alert description'
        }
      }));
    });

    // Verify new alert was added
    await expect(alertSection.getByRole('listitem')).toHaveCount(initialCount + 1);
    await expect(alertSection.getByRole('heading', { name: /test alert/i })).toBeVisible();
  });
}); 