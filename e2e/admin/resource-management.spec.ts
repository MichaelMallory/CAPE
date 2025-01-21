import { test, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../.auth/support-staff.json');

test.describe('Resource Management', () => {
  test.use({ storageState: authFile });

  test.beforeEach(async ({ page }) => {
    await page.goto('/support/dashboard');
  });

  test('should display resource overview with correct categories', async ({ page }) => {
    const resourcePanel = page.getByRole('region', { name: 'Resource Status' });
    
    // Verify resource categories
    await expect(resourcePanel.getByRole('heading', { name: 'Heroes' })).toBeVisible();
    await expect(resourcePanel.getByRole('heading', { name: 'Equipment' })).toBeVisible();
    await expect(resourcePanel.getByRole('heading', { name: 'Facilities' })).toBeVisible();
    
    // Verify status indicators
    await expect(resourcePanel.getByRole('status', { name: 'Available Heroes' })).toBeVisible();
    await expect(resourcePanel.getByRole('status', { name: 'On Mission' })).toBeVisible();
    await expect(resourcePanel.getByRole('status', { name: 'Equipment Ready' })).toBeVisible();
    await expect(resourcePanel.getByRole('status', { name: 'In Maintenance' })).toBeVisible();
  });

  test('should show resource allocation details', async ({ page }) => {
    const resourcePanel = page.getByRole('region', { name: 'Resource Status' });
    
    // Open hero allocation view
    await resourcePanel.getByRole('button', { name: 'View Hero Allocation' }).click();
    
    // Verify allocation details
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Hero Allocation' })).toBeVisible();
    await expect(page.getByRole('grid')).toBeVisible();
    
    // Check allocation timeline
    await expect(page.getByRole('gridcell', { name: /Captain Thunder/ })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: /Downtown Patrol/ })).toBeVisible();
  });

  test('should allow resource scheduling', async ({ page }) => {
    const resourcePanel = page.getByRole('region', { name: 'Resource Status' });
    
    // Open scheduling interface
    await resourcePanel.getByRole('button', { name: 'Schedule Resources' }).click();
    
    // Verify scheduling components
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Resource Scheduling' })).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Resource Type' })).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Resource' })).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Assignment' })).toBeVisible();
    
    // Test scheduling flow
    await page.getByRole('combobox', { name: 'Resource Type' }).selectOption('hero');
    await page.getByRole('combobox', { name: 'Resource' }).selectOption('captain-thunder');
    await page.getByRole('combobox', { name: 'Assignment' }).selectOption('downtown-patrol');
    await page.getByRole('button', { name: 'Schedule' }).click();
    
    // Verify schedule update
    await expect(page.getByText('Resource scheduled successfully')).toBeVisible();
  });

  test('should display resource tracking metrics', async ({ page }) => {
    const resourcePanel = page.getByRole('region', { name: 'Resource Status' });
    
    // Open tracking view
    await resourcePanel.getByRole('button', { name: 'View Metrics' }).click();
    
    // Verify tracking components
    await expect(page.getByRole('heading', { name: 'Resource Metrics' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Utilization' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Availability' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Performance' })).toBeVisible();
    
    // Check metric displays
    await expect(page.getByRole('figure')).toHaveCount(3); // Charts
    await expect(page.getByRole('meter')).toBeVisible(); // Utilization meters
    await expect(page.getByRole('table')).toBeVisible(); // Metrics table
  });

  test('should handle resource alerts and notifications', async ({ page }) => {
    const resourcePanel = page.getByRole('region', { name: 'Resource Status' });
    
    // Verify alert indicators
    await expect(resourcePanel.getByRole('alert')).toBeVisible();
    await expect(resourcePanel.getByText(/Low Equipment Availability/)).toBeVisible();
    
    // Test alert interaction
    await resourcePanel.getByRole('button', { name: 'View Alerts' }).click();
    await expect(page.getByRole('dialog', { name: 'Resource Alerts' })).toBeVisible();
    await expect(page.getByRole('list', { name: 'Alert List' })).toBeVisible();
  });
}); 