import { test, expect } from '@playwright/test';

test.describe('Quick Actions', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to hero dashboard
    await page.goto('/hero/dashboard');
  });

  test('should display quick action buttons with correct information', async ({ page }) => {
    // Check for quick actions section
    const actionsSection = await page.getByRole('region', { name: /quick actions/i });
    await expect(actionsSection).toBeVisible();

    // Verify action buttons exist
    const buttons = await actionsSection.getByRole('button').all();
    expect(buttons.length).toBeGreaterThan(0);

    // Check common actions are present
    await expect(actionsSection.getByRole('button', { name: /request backup/i })).toBeVisible();
    await expect(actionsSection.getByRole('button', { name: /report incident/i })).toBeVisible();
    await expect(actionsSection.getByRole('button', { name: /equipment check/i })).toBeVisible();
  });

  test('should show backup request form when clicking request backup', async ({ page }) => {
    const actionsSection = await page.getByRole('region', { name: /quick actions/i });
    
    // Click request backup button
    await actionsSection.getByRole('button', { name: /request backup/i }).click();
    
    // Verify form appears
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading')).toHaveText(/backup request/i);
    
    // Check form fields
    await expect(dialog.getByRole('combobox', { name: /priority/i })).toBeVisible();
    await expect(dialog.getByRole('textbox', { name: /location/i })).toBeVisible();
    await expect(dialog.getByRole('spinbutton', { name: /heroes needed/i })).toBeVisible();
    await expect(dialog.getByRole('textbox', { name: /situation/i })).toBeVisible();
  });

  test('should show incident report form when clicking report incident', async ({ page }) => {
    const actionsSection = await page.getByRole('region', { name: /quick actions/i });
    
    // Click report incident button
    await actionsSection.getByRole('button', { name: /report incident/i }).click();
    
    // Verify form appears
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading')).toHaveText(/incident report/i);
    
    // Check form fields
    await expect(dialog.getByRole('combobox', { name: /type/i })).toBeVisible();
    await expect(dialog.getByRole('textbox', { name: /location/i })).toBeVisible();
    await expect(dialog.getByRole('spinbutton', { name: /casualties/i })).toBeVisible();
    await expect(dialog.getByRole('textbox', { name: /description/i })).toBeVisible();
  });

  test('should initiate equipment check when clicking equipment check', async ({ page }) => {
    const actionsSection = await page.getByRole('region', { name: /quick actions/i });
    
    // Click equipment check button
    await actionsSection.getByRole('button', { name: /equipment check/i }).click();
    
    // Verify check started
    await expect(page.getByText(/equipment check in progress/i)).toBeVisible();
    
    // Wait for and verify results
    await expect(page.getByRole('heading', { name: /check complete/i })).toBeVisible();
    await expect(page.getByRole('list', { name: /equipment status/i })).toBeVisible();
  });

  test('should show recently used actions first', async ({ page }) => {
    const actionsSection = await page.getByRole('region', { name: /quick actions/i });
    
    // Get initial order
    const initialButtons = await actionsSection.getByRole('button').all();
    const initialOrder = await Promise.all(initialButtons.map(button => button.textContent()));
    
    // Click an action button
    await actionsSection.getByRole('button', { name: /report incident/i }).click();
    
    // Close the dialog
    await page.getByRole('button', { name: /cancel/i }).click();
    
    // Verify order changed
    const updatedButtons = await actionsSection.getByRole('button').all();
    const updatedOrder = await Promise.all(updatedButtons.map(button => button.textContent()));
    expect(updatedOrder[0]).toContain('Report Incident');
    expect(updatedOrder).not.toEqual(initialOrder);
  });
}); 