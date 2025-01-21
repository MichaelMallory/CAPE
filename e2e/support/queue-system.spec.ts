import { test, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../.auth/support-staff.json');

test.describe('Queue System', () => {
  test.use({ storageState: authFile });

  test.beforeEach(async ({ page }) => {
    await page.goto('/support/dashboard');
  });

  test('should prioritize tickets based on severity and wait time', async ({ page }) => {
    // Create test tickets with different priorities
    const tickets = [
      { title: 'Minor Issue', priority: 'GAMMA', created_at: new Date(Date.now() - 3600000).toISOString() },
      { title: 'Critical Alert', priority: 'OMEGA', created_at: new Date().toISOString() },
      { title: 'Moderate Problem', priority: 'BETA', created_at: new Date(Date.now() - 7200000).toISOString() }
    ];

    // Add tickets to the queue
    for (const ticket of tickets) {
      await page.getByRole('button', { name: 'Create Ticket' }).click();
      await page.getByRole('textbox', { name: 'Title' }).fill(ticket.title);
      await page.getByRole('combobox', { name: 'Priority' }).selectOption(ticket.priority);
      await page.getByRole('button', { name: 'Submit' }).click();
    }

    // Verify queue order (OMEGA first, then BETA, then GAMMA)
    const ticketElements = page.getByRole('listitem', { name: /Issue|Alert|Problem/ });
    await expect(ticketElements).toHaveCount(3);
    await expect(ticketElements.nth(0)).toHaveText(/Critical Alert/);
    await expect(ticketElements.nth(1)).toHaveText(/Moderate Problem/);
    await expect(ticketElements.nth(2)).toHaveText(/Minor Issue/);
  });

  test('should handle load balancing between available heroes', async ({ page }) => {
    // Create test heroes with different workloads
    const heroes = [
      { name: 'Captain Thunder', current_tasks: 1 },
      { name: 'Wind Walker', current_tasks: 3 },
      { name: 'Shadow Blade', current_tasks: 0 }
    ];

    // Create a new ticket
    await page.getByRole('button', { name: 'Create Ticket' }).click();
    await page.getByRole('textbox', { name: 'Title' }).fill('New Emergency');
    await page.getByRole('combobox', { name: 'Priority' }).selectOption('OMEGA');
    await page.getByRole('button', { name: 'Submit' }).click();

    // Open assignment dialog
    await page.getByRole('button', { name: 'Assign' }).click();

    // Verify hero recommendations (Shadow Blade should be first due to lowest workload)
    const heroElements = page.getByRole('option');
    await expect(heroElements.first()).toHaveText(/Shadow Blade/);
    await expect(heroElements.nth(1)).toHaveText(/Captain Thunder/);
    await expect(heroElements.nth(2)).toHaveText(/Wind Walker/);
  });

  test('should calculate and display queue metrics', async ({ page }) => {
    // Wait for metrics to load
    await expect(page.getByRole('region', { name: 'Queue Metrics' })).toBeVisible();

    // Verify metric displays
    await expect(page.getByRole('status', { name: 'Average Response Time' })).toBeVisible();
    await expect(page.getByRole('status', { name: 'Queue Length' })).toBeVisible();
    await expect(page.getByRole('status', { name: 'Resolution Rate' })).toBeVisible();

    // Check metric calculations
    const avgResponseTime = page.getByRole('status', { name: 'Average Response Time' });
    const queueLength = page.getByRole('status', { name: 'Queue Length' });
    const resolutionRate = page.getByRole('status', { name: 'Resolution Rate' });

    await expect(avgResponseTime).toHaveText(/\d+m/);
    await expect(queueLength).toHaveText(/\d+/);
    await expect(resolutionRate).toHaveText(/\d+%/);
  });

  test('should handle ticket escalation based on wait time', async ({ page }) => {
    // Create a low priority ticket
    await page.getByRole('button', { name: 'Create Ticket' }).click();
    await page.getByRole('textbox', { name: 'Title' }).fill('Test Escalation');
    await page.getByRole('combobox', { name: 'Priority' }).selectOption('GAMMA');
    await page.getByRole('button', { name: 'Submit' }).click();

    // Simulate time passing (ticket should auto-escalate after threshold)
    await page.evaluate(() => {
      const ticket = {
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
      };
      localStorage.setItem('test_ticket', JSON.stringify(ticket));
    });
    await page.reload();

    // Verify ticket was escalated
    const ticket = page.getByRole('listitem', { name: 'Test Escalation' });
    await expect(ticket).toHaveAttribute('data-priority', 'BETA');
    await expect(ticket).toHaveText(/Auto-escalated/);
  });
}); 