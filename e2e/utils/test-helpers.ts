import { Page, expect } from '@playwright/test';
import { Priority, Status, TicketType } from '@/types';

export async function createTicket(page: Page, {
  title,
  description,
  priority = 'BETA' as Priority,
  type = 'MISSION' as TicketType,
}: {
  title: string;
  description: string;
  priority?: Priority;
  type?: TicketType;
}) {
  // Navigate to create ticket page
  await page.goto('/tickets/new');
  
  // Fill in ticket details
  await page.getByRole('textbox', { name: /title/i }).fill(title);
  await page.getByRole('textbox', { name: /description/i }).fill(description);
  await page.getByRole('combobox', { name: /priority/i }).selectOption(priority);
  await page.getByRole('combobox', { name: /type/i }).selectOption(type);
  
  // Submit the form
  await page.getByRole('button', { name: /create/i }).click();
  
  // Wait for success notification
  await expect(page.getByText(/ticket created successfully/i)).toBeVisible();
}

export async function assignHeroToMission(page: Page, {
  heroCodename,
  missionId,
}: {
  heroCodename: string;
  missionId: string;
}) {
  await page.goto(`/missions/${missionId}`);
  
  // Open hero assignment modal
  await page.getByRole('button', { name: /assign hero/i }).click();
  
  // Search and select hero
  await page.getByRole('searchbox', { name: /search heroes/i }).fill(heroCodename);
  await page.getByRole('option', { name: RegExp(heroCodename, 'i') }).click();
  
  // Confirm assignment
  await page.getByRole('button', { name: /confirm/i }).click();
  
  // Wait for success notification
  await expect(page.getByText(/hero assigned successfully/i)).toBeVisible();
}

export async function checkEquipmentStatus(page: Page, {
  equipmentId,
  expectedStatus,
}: {
  equipmentId: string;
  expectedStatus: 'OPERATIONAL' | 'MAINTENANCE' | 'DAMAGED';
}) {
  await page.goto(`/equipment/${equipmentId}`);
  
  // Check equipment status
  await expect(page.getByRole('status')).toHaveText(RegExp(expectedStatus, 'i'));
}

export async function verifyTicketPriority(page: Page, {
  ticketId,
  expectedPriority,
}: {
  ticketId: string;
  expectedPriority: Priority;
}) {
  await page.goto(`/tickets/${ticketId}`);
  
  // Verify priority indicator
  const priorityElement = page.getByTestId('priority-indicator');
  await expect(priorityElement).toHaveAttribute('data-priority', expectedPriority.toLowerCase());
  await expect(priorityElement).toHaveClass(RegExp(`priority-${expectedPriority.toLowerCase()}`));
}

export async function logout(page: Page) {
  // Open user menu
  await page.getByRole('button', { name: /user menu/i }).click();
  
  // Click logout
  await page.getByRole('menuitem', { name: /sign out/i }).click();
  
  // Verify we're logged out
  await expect(page.getByRole('heading', { name: /welcome to cape/i })).toBeVisible();
} 