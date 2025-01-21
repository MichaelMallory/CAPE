import { test, expect } from '@playwright/test';

test.describe('Preferences Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/preferences');
  });

  test('should display preferences form with correct sections', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Hero Preferences' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Notification Preferences' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Accessibility Settings' })).toBeVisible();
  });

  test('should toggle notification preferences', async ({ page }) => {
    const missionUpdatesSwitch = page.getByRole('switch', { name: 'Mission Updates' });
    const equipmentAlertsSwitch = page.getByRole('switch', { name: 'Equipment Alerts' });

    // Check initial state
    await expect(missionUpdatesSwitch).toBeChecked();
    await expect(equipmentAlertsSwitch).toBeChecked();

    // Toggle switches
    await missionUpdatesSwitch.click();
    await equipmentAlertsSwitch.click();

    // Verify new state
    await expect(missionUpdatesSwitch).not.toBeChecked();
    await expect(equipmentAlertsSwitch).not.toBeChecked();
  });

  test('should toggle accessibility settings', async ({ page }) => {
    const reduceMotionSwitch = page.getByRole('switch', { name: 'Reduce Motion' });
    const highContrastSwitch = page.getByRole('switch', { name: 'High Contrast' });

    // Check initial state
    await expect(reduceMotionSwitch).not.toBeChecked();
    await expect(highContrastSwitch).not.toBeChecked();

    // Toggle switches
    await reduceMotionSwitch.click();
    await highContrastSwitch.click();

    // Verify new state
    await expect(reduceMotionSwitch).toBeChecked();
    await expect(highContrastSwitch).toBeChecked();
  });

  test('should show error when all notifications are disabled', async ({ page }) => {
    // Disable all notifications
    await page.getByRole('switch', { name: 'Mission Updates' }).click();
    await page.getByRole('switch', { name: 'Equipment Alerts' }).click();
    await page.getByRole('switch', { name: 'Team Messages' }).click();
    await page.getByRole('switch', { name: 'Security Alerts' }).click();

    // Verify error message appears
    await expect(page.getByText('At least one notification type must be enabled')).toBeVisible();

    // Verify submit button is disabled
    await expect(page.getByRole('button', { name: 'Save Preferences' })).toBeDisabled();

    // Enable one notification and verify error clears
    await page.getByRole('switch', { name: 'Mission Updates' }).click();
    await expect(page.getByText('At least one notification type must be enabled')).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Save Preferences' })).toBeEnabled();
  });

  test('should show success notification on form submission', async ({ page }) => {
    // Submit form with valid data
    await page.getByRole('button', { name: 'Save Preferences' }).click();

    // Verify success notification appears
    await expect(page.getByRole('status')).toBeVisible();
    await expect(page.getByText('POW! Preferences Updated!')).toBeVisible();
    await expect(page.getByText('Your hero settings have been saved successfully.')).toBeVisible();
  });

  test('should show error notification when submission fails', async ({ page }) => {
    // Mock a failed API call
    await page.route('**/api/preferences', route => route.abort());

    // Submit form
    await page.getByRole('button', { name: 'Save Preferences' }).click();

    // Verify error notification appears
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByText('CRASH! Something Went Wrong!')).toBeVisible();
    await expect(page.getByText('Unable to save your preferences. Please try again.')).toBeVisible();
  });
}); 