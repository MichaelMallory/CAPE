import { test, expect } from '@playwright/test';
import path from 'path';

// Configure tests to run sequentially
test.describe.configure({ mode: 'serial' });

// Use auth state for all tests in this file
const authFile = path.join(__dirname, '.auth/support-staff.json');
test.use({ storageState: authFile });

test.describe('Ticket System Phase 1', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate directly to support dashboard
    await page.goto('/dashboard/support');
    // Wait for initial load
    await page.waitForLoadState('networkidle');
  });

  test.describe('Assignment System', () => {
    test('should allow assigning ticket to organization member', async ({ page }) => {
      // Find first unassigned ticket and click details
      const unassignedTicket = page.getByTestId('ticket-unassigned').first();
      await unassignedTicket.waitFor();
      await page.getByTestId('ticket-details-button').first().click();
      
      // Wait for modal to be visible
      await page.getByTestId('ticket-details-modal').waitFor();
      
      // Search for assignee
      await page.getByTestId('assignee-search').fill('support');
      await page.getByTestId('assign-button').click();
      
      // Wait for search results and select first option
      await page.getByTestId('assignee-option').first().waitFor();
      await page.getByTestId('assignee-option').first().click();
      
      // Save assignment
      await page.getByTestId('save-assignment').click();
      
      // Verify assignment was successful
      await expect(page.getByTestId('assignment-success')).toBeVisible();
    });

    test('should route equipment tickets to equipment team', async ({ page }) => {
      // Create new equipment ticket
      await page.getByTestId('new-ticket-button').click();
      await page.getByTestId('ticket-type-select').selectOption('EQUIPMENT');
      await page.getByTestId('ticket-title').fill('Test Equipment Issue');
      await page.getByTestId('ticket-description').fill('Equipment test description');
      await page.getByTestId('submit-ticket').click();

      // Verify it's routed to equipment team
      await expect(page.getByTestId('equipment-team-badge')).toBeVisible();
    });
  });

  test.describe('Status Management', () => {
    test('should allow changing ticket status', async ({ page }) => {
      // Open first ticket
      await page.getByTestId('ticket-item').first().click();
      
      // Change status to IN_PROGRESS
      await page.getByTestId('status-select').click();
      await page.getByTestId('status-option-in-progress').click();
      
      // Verify status change
      await expect(page.getByTestId('status-badge')).toHaveText(/in progress/i);
      
      // Verify timestamp updated
      await expect(page.getByTestId('last-updated')).toBeVisible();
    });
  });

  test.describe('Priority Management', () => {
    test('should allow changing ticket priority', async ({ page }) => {
      // Open first ticket
      await page.getByTestId('ticket-item').first().click();
      
      // Change priority to ALPHA
      await page.getByTestId('priority-select').click();
      await page.getByTestId('priority-option-alpha').click();
      
      // Verify priority change
      await expect(page.getByTestId('priority-badge')).toHaveText(/alpha/i);
    });

    test('should sort tickets by priority', async ({ page }) => {
      // Click sort by priority
      await page.getByTestId('sort-button').click();
      await page.getByTestId('sort-option-priority').click();
      
      // Verify OMEGA tickets appear first
      const firstTicketPriority = await page.getByTestId('ticket-priority').first().textContent();
      expect(firstTicketPriority).toContain('OMEGA');
    });
  });

  test.describe('Real-time Updates', () => {
    test('should update ticket queue in real-time', async ({ page, browser }) => {
      // Open a new browser context for creating updates
      const adminContext = await browser.newContext({ storageState: path.join(__dirname, '.auth/support-staff.json') });
      const adminPage = await adminContext.newPage();
      await adminPage.goto('/dashboard/support');

      // Create a new ticket in admin context
      await adminPage.getByTestId('new-ticket-button').click();
      await adminPage.getByTestId('ticket-title').fill('Real-time Test Ticket');
      await adminPage.getByTestId('submit-ticket').click();

      // Verify ticket appears in original context
      await expect(page.getByTestId('ticket-title')).toHaveText('Real-time Test Ticket');
      
      await adminContext.close();
    });

    test('should show active ticket counts by status', async ({ page }) => {
      // Verify status counts are visible
      await expect(page.getByTestId('status-new-count')).toBeVisible();
      await expect(page.getByTestId('status-in-progress-count')).toBeVisible();
      await expect(page.getByTestId('status-assigned-count')).toBeVisible();
      await expect(page.getByTestId('status-resolved-count')).toBeVisible();
    });
  });
}); 