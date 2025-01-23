import { test, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../.auth/support-staff.json');

test.describe('Support Dashboard Content & Functionality', () => {
  test.use({ storageState: authFile });

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/support');
    // Wait for the main dashboard to be visible
    await expect(page.getByRole('main', { name: 'Support Dashboard' })).toBeVisible();
  });

  test('displays dashboard header and controls', async ({ page }) => {
    // Verify header
    await expect(page.getByRole('heading', { name: 'Support Dashboard', level: 1 })).toBeVisible();
    
    // Verify layout controls
    const layoutButton = page.getByLabel('Layout');
    await expect(layoutButton).toBeVisible();
    
    // Test layout customization
    await layoutButton.click();
    await expect(page.getByRole('heading', { name: 'Customize Dashboard' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reset Layout' })).toBeVisible();
  });

  test('displays ticket queue with mock data', async ({ page }) => {
    const ticketSection = page.getByRole('region', { name: 'Ticket Queue' });
    await expect(ticketSection).toBeVisible();
    
    // Verify mock tickets are present
    await expect(page.getByText('Equipment malfunction during mission')).toBeVisible();
    await expect(page.getByText('Request for backup support')).toBeVisible();
    await expect(page.getByText('Mission debrief scheduling')).toBeVisible();
  });

  test('displays active missions panel', async ({ page }) => {
    const missionsPanel = page.getByRole('region', { name: 'Active Missions' });
    await expect(missionsPanel).toBeVisible();
  });

  test('displays resource status panel', async ({ page }) => {
    const resourcePanel = page.getByRole('region', { name: 'Resource Status' });
    await expect(resourcePanel).toBeVisible();
  });

  test('displays priority alerts panel', async ({ page }) => {
    const alertsPanel = page.getByRole('region', { name: 'Priority Alerts' });
    await expect(alertsPanel).toBeVisible();
  });

  test('displays team chat panel', async ({ page }) => {
    const chatPanel = page.getByRole('region', { name: 'Team Chat' });
    await expect(chatPanel).toBeVisible();
  });

  test('supports panel customization', async ({ page }) => {
    // Open customization panel
    await page.getByLabel('Layout').click();
    
    // Test hiding a panel
    const ticketQueueToggle = page.getByRole('button', { name: 'Toggle Ticket Queue' });
    await ticketQueueToggle.click();
    
    // Verify panel is hidden
    await expect(page.getByRole('region', { name: 'Ticket Queue' })).not.toBeVisible();
    
    // Reset layout
    await page.getByRole('button', { name: 'Reset Layout' }).click();
    
    // Verify panel is visible again
    await expect(page.getByRole('region', { name: 'Ticket Queue' })).toBeVisible();
  });
}); 