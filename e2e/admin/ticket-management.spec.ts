import { test, expect } from '@playwright/test';
import path from 'path';

const supportAuthFile = path.join(__dirname, '../.auth/support-staff.json');
const heroAuthFile = path.join(__dirname, '../.auth/hero.json');

test.describe('Ticket Management', () => {
  test.describe('as support staff', () => {
    test.use({ storageState: supportAuthFile });

    test.beforeEach(async ({ page }) => {
      await page.goto('/dashboard/support');
      // Wait for the ticket queue to be visible
      await expect(page.getByRole('region', { name: 'Ticket Queue' })).toBeVisible();
    });

    test('displays AI-triaged ticket queue', async ({ page }) => {
      // Verify queue headers and AI triage indicators
      const ticketQueue = page.getByRole('region', { name: 'Ticket Queue' });
      await expect(ticketQueue.getByRole('table')).toBeVisible();
      
      // Check for AI triage status
      await expect(ticketQueue.getByText('AI Triage Score')).toBeVisible();
      await expect(ticketQueue.getByRole('cell', { name: /High|Medium|Low/ })).toBeVisible();
    });

    test('can filter and sort tickets', async ({ page }) => {
      const ticketQueue = page.getByRole('region', { name: 'Ticket Queue' });
      
      // Test status filter
      await page.getByRole('button', { name: 'Filter by Status' }).click();
      await page.getByRole('option', { name: 'In Progress' }).click();
      await expect(ticketQueue.getByRole('cell', { name: 'NEW' })).not.toBeVisible();
      
      // Test priority sort
      await page.getByRole('columnheader', { name: 'Priority' }).click();
      const priorities = await ticketQueue.getByRole('cell', { name: /OMEGA|ALPHA|BETA|GAMMA/ }).allTextContents();
      const priorityOrder = { OMEGA: 4, ALPHA: 3, BETA: 2, GAMMA: 1 };
      // Verify priorities are in descending order
      for (let i = 1; i < priorities.length; i++) {
        expect(priorityOrder[priorities[i - 1] as keyof typeof priorityOrder])
          .toBeGreaterThanOrEqual(priorityOrder[priorities[i] as keyof typeof priorityOrder]);
      }
    });

    test('can view and update ticket details', async ({ page }) => {
      // Click on first ticket
      await page.getByRole('row').nth(1).click();
      
      // Verify ticket details modal
      await expect(page.getByRole('dialog', { name: /Ticket Details/i })).toBeVisible();
      
      // Check ticket information is displayed
      await expect(page.getByText('Equipment malfunction during mission')).toBeVisible();
      await expect(page.getByText('ALPHA')).toBeVisible();
      
      // Update ticket status
      await page.getByRole('button', { name: 'Update Status' }).click();
      await page.getByRole('option', { name: 'In Progress' }).click();
      await expect(page.getByText('Status updated successfully')).toBeVisible();
    });

    test('can assign tickets to staff members', async ({ page }) => {
      // Click assign button on first ticket
      await page.getByRole('row').nth(1).getByRole('button', { name: 'Assign' }).click();
      
      // Verify assignment modal
      await expect(page.getByRole('dialog', { name: 'Assign Ticket' })).toBeVisible();
      
      // Select staff member
      await page.getByRole('combobox', { name: 'Select Staff Member' }).click();
      await page.getByRole('option', { name: 'Support Team A' }).click();
      
      // Confirm assignment
      await page.getByRole('button', { name: 'Confirm Assignment' }).click();
      await expect(page.getByText('Ticket assigned successfully')).toBeVisible();
    });

    test('can escalate tickets to specialists', async ({ page }) => {
      // Open first ticket
      await page.getByRole('row').nth(1).click();
      
      // Click escalate button
      await page.getByRole('button', { name: 'Escalate' }).click();
      
      // Fill escalation form
      await page.getByLabel('Escalation Reason').fill('Requires specialized equipment expertise');
      await page.getByRole('combobox', { name: 'Select Specialist' }).click();
      await page.getByRole('option', { name: 'Equipment Specialist' }).click();
      
      // Submit escalation
      await page.getByRole('button', { name: 'Confirm Escalation' }).click();
      await expect(page.getByText('Ticket escalated successfully')).toBeVisible();
    });

    test('can document solutions and close tickets', async ({ page }) => {
      // Open first ticket
      await page.getByRole('row').nth(1).click();
      
      // Add solution documentation
      await page.getByRole('button', { name: 'Add Solution' }).click();
      await page.getByLabel('Solution Details').fill('Equipment recalibrated and tested. All systems operational.');
      
      // Add resolution notes
      await page.getByLabel('Internal Notes').fill('Performed full diagnostic scan. No further issues detected.');
      
      // Close ticket
      await page.getByRole('button', { name: 'Close Ticket' }).click();
      await page.getByRole('button', { name: 'Confirm Close' }).click();
      
      await expect(page.getByText('Ticket closed successfully')).toBeVisible();
    });

    test('can adjust ticket priority levels', async ({ page }) => {
      // Open first ticket
      await page.getByRole('row').nth(1).click();
      
      // Change priority
      await page.getByRole('button', { name: 'Update Priority' }).click();
      await page.getByRole('option', { name: 'OMEGA' }).click();
      
      // Verify priority change
      await expect(page.getByText('Priority updated successfully')).toBeVisible();
      await expect(page.getByRole('cell', { name: 'OMEGA' })).toBeVisible();
    });

    test('displays AI-suggested responses', async ({ page }) => {
      // Open first ticket
      await page.getByRole('row').nth(1).click();
      
      // Check for AI suggestions section
      await expect(page.getByText('AI Suggested Responses')).toBeVisible();
      
      // Verify suggested responses are loaded
      await expect(page.getByRole('list', { name: 'Suggested Responses' })).toBeVisible();
      const responseCount = await page.getByRole('listitem').count();
      expect(responseCount).toBeGreaterThan(0);
    });

    test('supports real-time updates', async ({ page }) => {
      const ticketQueue = page.getByRole('region', { name: 'Ticket Queue' });
      
      // Create a new ticket in another session (simulated)
      await page.evaluate(() => {
        window.postMessage({
          type: 'REALTIME_SUBSCRIPTION',
          payload: {
            new: {
              id: 'T-999',
              title: 'Emergency Backup Required',
              priority: 'OMEGA',
              status: 'NEW',
              timestamp: 'Just now',
              aiTriageScore: 'High'
            }
          }
        }, '*');
      });
      
      // Verify new ticket appears in queue
      await expect(page.getByText('Emergency Backup Required')).toBeVisible();
      await expect(page.getByText('Just now')).toBeVisible();
    });
  });

  test.describe('as hero', () => {
    test.use({ storageState: heroAuthFile });

    test('can create and track support tickets', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Create new ticket
      await page.getByRole('button', { name: 'Create Ticket' }).click();
      await page.getByLabel('Title').fill('Equipment malfunction');
      await page.getByLabel('Description').fill('Suit power system failing');
      await page.getByLabel('Priority').selectOption('ALPHA');
      await page.getByLabel('Type').selectOption('EQUIPMENT');
      await page.getByRole('button', { name: 'Submit' }).click();
      
      // Verify ticket appears in list
      await expect(page.getByRole('row', { name: /Equipment malfunction/ })).toBeVisible();
      
      // Check ticket status
      await expect(page.getByRole('cell', { name: 'NEW' })).toBeVisible();
    });

    test('can view and respond to support communication', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Open ticket
      await page.getByRole('row', { name: /Equipment malfunction/ }).click();
      
      // Add response to support
      await page.getByRole('textbox', { name: 'Add comment' }).fill('Additional details: System shows error code E-123');
      await page.getByRole('button', { name: 'Send' }).click();
      
      // Verify response appears
      await expect(page.getByRole('log').getByText('Additional details: System shows error code E-123')).toBeVisible();
    });
  });
}); 