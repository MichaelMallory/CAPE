import { test as base, expect } from '@playwright/test';
import { SELECTORS } from '../utils/test-constants';

// Extend the base test fixture with our custom pages and utilities
export const test = base.extend({
  // Add custom fixtures here
  dashboardPage: async ({ page }, use) => {
    // Dashboard page utilities
    await use({
      async navigateTo() {
        await page.click(SELECTORS.NAVIGATION.dashboard);
        await expect(page).toHaveURL('/dashboard');
      },
      async createTicket(title: string, description: string, priority: string) {
        await page.click('[data-test-id="create-ticket"]');
        await page.fill('[data-test-id="ticket-title"]', title);
        await page.fill('[data-test-id="ticket-description"]', description);
        await page.selectOption('[data-test-id="ticket-priority"]', priority);
        await page.click('[data-test-id="submit-ticket"]');
      },
      async verifyTicketCreated(title: string) {
        await expect(page.locator(`text=${title}`)).toBeVisible();
      }
    });
  },
  equipmentPage: async ({ page }, use) => {
    // Equipment page utilities
    await use({
      async navigateTo() {
        await page.click(SELECTORS.NAVIGATION.equipment);
        await expect(page).toHaveURL('/equipment');
      },
      async checkoutEquipment(equipmentId: string) {
        await page.click(`[data-test-id="checkout-${equipmentId}"]`);
        await page.click('[data-test-id="confirm-checkout"]');
      }
    });
  }
});

// Export expect for convenience
export { expect }; 