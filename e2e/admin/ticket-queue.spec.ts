import { test, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../.auth/support-staff.json');

test.describe('Ticket Queue', () => {
  test.use({ storageState: authFile });

  test.beforeEach(async ({ page }) => {
    await page.goto('/support/dashboard');
  });

  test('should display ticket list with correct priority levels', async ({ page }) => {
    const ticketQueue = page.getByRole('region', { name: 'Ticket Queue' });
    
    // Verify priority level indicators
    await expect(ticketQueue.getByRole('status', { name: 'OMEGA Priority' })).toBeVisible();
    await expect(ticketQueue.getByRole('status', { name: 'ALPHA Priority' })).toBeVisible();
    await expect(ticketQueue.getByRole('status', { name: 'BETA Priority' })).toBeVisible();
    await expect(ticketQueue.getByRole('status', { name: 'GAMMA Priority' })).toBeVisible();
  });

  test('should allow sorting tickets by different criteria', async ({ page }) => {
    const ticketQueue = page.getByRole('region', { name: 'Ticket Queue' });
    
    // Open sort menu
    await ticketQueue.getByRole('button', { name: 'Sort' }).click();
    
    // Verify sort options
    await expect(page.getByRole('menuitem', { name: 'Priority' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Date' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Status' })).toBeVisible();
    
    // Sort by priority
    await page.getByRole('menuitem', { name: 'Priority' }).click();
    
    // Verify OMEGA tickets appear first
    const firstTicket = ticketQueue.getByRole('row').first();
    await expect(firstTicket.getByRole('status')).toHaveText('OMEGA');
  });

  test('should allow filtering tickets', async ({ page }) => {
    const ticketQueue = page.getByRole('region', { name: 'Ticket Queue' });
    
    // Open filter menu
    await ticketQueue.getByRole('button', { name: 'Filter' }).click();
    
    // Apply priority filter
    await page.getByRole('checkbox', { name: 'OMEGA' }).check();
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    
    // Verify only OMEGA tickets are shown
    await expect(ticketQueue.getByRole('status').filter({ hasText: 'OMEGA' })).toHaveCount(
      await ticketQueue.getByRole('status').count()
    );
  });

  test('should allow batch selection and actions', async ({ page }) => {
    const ticketQueue = page.getByRole('region', { name: 'Ticket Queue' });
    
    // Select multiple tickets
    await ticketQueue.getByRole('checkbox', { name: 'Select all tickets' }).check();
    
    // Verify batch actions become available
    await expect(page.getByRole('button', { name: 'Assign Selected' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Update Status' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Update Priority' })).toBeVisible();
  });

  test('should display ticket details on selection', async ({ page }) => {
    const ticketQueue = page.getByRole('region', { name: 'Ticket Queue' });
    
    // Click first ticket
    await ticketQueue.getByRole('row').first().click();
    
    // Verify ticket details panel appears
    await expect(page.getByRole('region', { name: 'Ticket Details' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Ticket Information' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Assign Hero' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Update Status' })).toBeVisible();
  });
}); 