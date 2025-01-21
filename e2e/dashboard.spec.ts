import { test, expect } from './fixtures/test-fixture';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('should create a new mission support ticket', async ({ dashboardPage }) => {
    const ticketTitle = 'Investigate Mysterious Energy Signature';
    const description = 'High-energy readings detected in downtown area. Requires immediate investigation.';
    
    await dashboardPage.createTicket(ticketTitle, description, 'ALPHA');
    await dashboardPage.verifyTicketCreated(ticketTitle);
  });

  test('should display real-time mission updates', async ({ page }) => {
    // Wait for and verify real-time updates
    await expect(page.locator('[data-test-id="mission-feed"]')).toBeVisible();
    
    // Verify mission status updates appear
    await expect(page.locator('[data-test-id="mission-status"]')).toContainText('ACTIVE');
  });

  test('should show threat level indicators', async ({ page }) => {
    // Check that threat level indicators are present
    await expect(page.locator('[data-test-id="threat-level-indicator"]')).toBeVisible();
    
    // Verify threat level categories
    const threatLevels = ['OMEGA', 'ALPHA', 'BETA', 'GAMMA'];
    for (const level of threatLevels) {
      await expect(page.locator(`[data-test-id="threat-${level}"]`)).toBeVisible();
    }
  });
}); 