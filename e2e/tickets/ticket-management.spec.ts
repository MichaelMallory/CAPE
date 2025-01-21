import { test, expect } from '@playwright/test';
import path from 'path';
import { createTicket, verifyTicketPriority } from '../utils/test-helpers';

const authFile = path.join(__dirname, '../.auth/auth.json');

test.describe('Ticket Management', () => {
  test.use({ storageState: authFile });

  test.beforeEach(async ({ page }) => {
    await page.goto('/tickets');
  });

  test('should create a new mission ticket', async ({ page }) => {
    // Create a new mission ticket
    await createTicket(page, {
      title: 'Investigate Mysterious Energy Signature',
      description: 'High-energy readings detected in downtown area. Requires immediate investigation.',
      priority: 'ALPHA',
      type: 'MISSION',
    });

    // Verify ticket appears in the list
    await page.goto('/tickets');
    await expect(page.getByRole('link', { name: /investigate mysterious energy/i })).toBeVisible();
  });

  test('should update ticket priority', async ({ page }) => {
    // Create a ticket with BETA priority
    await createTicket(page, {
      title: 'Monitor Suspicious Activity',
      description: 'Regular patrol reported unusual patterns in criminal activity.',
      priority: 'BETA',
      type: 'INTELLIGENCE',
    });

    // Get the ticket ID from the URL after creation
    const ticketId = page.url().split('/').pop() as string;

    // Navigate to ticket details
    await page.goto(`/tickets/${ticketId}`);

    // Change priority to OMEGA
    await page.getByRole('button', { name: /edit priority/i }).click();
    await page.getByRole('combobox', { name: /priority/i }).selectOption('OMEGA');
    await page.getByRole('button', { name: /save/i }).click();

    // Verify priority was updated
    await verifyTicketPriority(page, {
      ticketId,
      expectedPriority: 'OMEGA',
    });
  });

  test('should filter tickets by type', async ({ page }) => {
    // Create tickets of different types
    await createTicket(page, {
      title: 'Equipment Maintenance Request',
      description: 'Annual maintenance check for anti-gravity boots.',
      type: 'EQUIPMENT',
    });

    await createTicket(page, {
      title: 'Villain Activity Report',
      description: 'Compile recent villain sightings and patterns.',
      type: 'INTELLIGENCE',
    });

    // Navigate to tickets page
    await page.goto('/tickets');

    // Filter by EQUIPMENT type
    await page.getByRole('combobox', { name: /filter by type/i }).selectOption('EQUIPMENT');

    // Verify only equipment tickets are shown
    await expect(page.getByText(/equipment maintenance request/i)).toBeVisible();
    await expect(page.getByText(/villain activity report/i)).not.toBeVisible();
  });

  test('should assign ticket to hero', async ({ page }) => {
    // Create a new ticket
    await createTicket(page, {
      title: 'Urgent: City Defense Required',
      description: 'Giant robot approaching downtown area.',
      priority: 'OMEGA',
    });

    // Get the ticket ID
    const ticketId = page.url().split('/').pop() as string;

    // Assign to a hero
    await page.getByRole('button', { name: /assign hero/i }).click();
    await page.getByRole('searchbox', { name: /search heroes/i }).fill('Captain');
    await page.getByRole('option', { name: /captain/i }).first().click();
    await page.getByRole('button', { name: /confirm/i }).click();

    // Verify assignment
    await expect(page.getByText(/assigned successfully/i)).toBeVisible();
    await expect(page.getByTestId('assigned-hero')).toBeVisible();
  });
}); 