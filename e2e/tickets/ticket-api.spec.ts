import { test, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../.auth/hero.json');
const supportAuthFile = path.join(__dirname, '../.auth/support-staff.json');

test.describe('Ticket API', () => {
  test.describe('as a hero', () => {
    test.use({ storageState: authFile });

    test('can create a new ticket', async ({ request }) => {
      const response = await request.post('/api/tickets', {
        data: {
          title: 'Test Equipment Issue',
          description: 'My super suit has a malfunction',
          type: 'EQUIPMENT',
          priority: 'BETA',
        },
      });

      expect(response.ok()).toBeTruthy();
      const ticket = await response.json();
      expect(ticket).toHaveProperty('id');
      expect(ticket.title).toBe('Test Equipment Issue');
      expect(ticket.status).toBe('NEW');
    });

    test('can view own tickets', async ({ request }) => {
      // First create a ticket
      const createResponse = await request.post('/api/tickets', {
        data: {
          title: 'Mission Support Needed',
          description: 'Need backup for ongoing mission',
          type: 'MISSION',
          priority: 'ALPHA',
        },
      });
      expect(createResponse.ok()).toBeTruthy();
      const createdTicket = await createResponse.json();

      // Then fetch the ticket list
      const listResponse = await request.get('/api/tickets');
      expect(listResponse.ok()).toBeTruthy();
      const { tickets } = await listResponse.json();
      expect(tickets.some((t: any) => t.id === createdTicket.id)).toBeTruthy();

      // Then fetch the specific ticket
      const ticketResponse = await request.get(`/api/tickets/${createdTicket.id}`);
      expect(ticketResponse.ok()).toBeTruthy();
      const ticket = await ticketResponse.json();
      expect(ticket.id).toBe(createdTicket.id);
    });

    test('can update own ticket', async ({ request }) => {
      // First create a ticket
      const createResponse = await request.post('/api/tickets', {
        data: {
          title: 'Initial Title',
          description: 'Initial description',
          type: 'INTELLIGENCE',
          priority: 'BETA',
        },
      });
      expect(createResponse.ok()).toBeTruthy();
      const createdTicket = await createResponse.json();

      // Then update it
      const updateResponse = await request.patch(`/api/tickets/${createdTicket.id}`, {
        data: {
          title: 'Updated Title',
          priority: 'ALPHA',
        },
      });
      expect(updateResponse.ok()).toBeTruthy();
      const updatedTicket = await updateResponse.json();
      expect(updatedTicket.title).toBe('Updated Title');
      expect(updatedTicket.priority).toBe('ALPHA');
    });

    test('cannot delete tickets', async ({ request }) => {
      // First create a ticket
      const createResponse = await request.post('/api/tickets', {
        data: {
          title: 'Ticket to delete',
          description: 'This should not be deletable',
          type: 'MISSION',
          priority: 'BETA',
        },
      });
      expect(createResponse.ok()).toBeTruthy();
      const createdTicket = await createResponse.json();

      // Try to delete it
      const deleteResponse = await request.delete(`/api/tickets/${createdTicket.id}`);
      expect(deleteResponse.status()).toBe(403);
    });
  });

  test.describe('as support staff', () => {
    test.use({ storageState: supportAuthFile });

    test('can view all tickets', async ({ request }) => {
      const response = await request.get('/api/tickets');
      expect(response.ok()).toBeTruthy();
      const { tickets, pagination } = await response.json();
      expect(Array.isArray(tickets)).toBeTruthy();
      expect(pagination).toHaveProperty('total');
    });

    test('can filter and search tickets', async ({ request }) => {
      // Create test tickets
      await request.post('/api/tickets', {
        data: {
          title: 'High Priority Mission',
          description: 'Urgent mission support needed',
          type: 'MISSION',
          priority: 'OMEGA',
        },
      });

      await request.post('/api/tickets', {
        data: {
          title: 'Low Priority Equipment',
          description: 'Minor equipment maintenance',
          type: 'EQUIPMENT',
          priority: 'GAMMA',
        },
      });

      // Test filtering by priority
      const priorityResponse = await request.get('/api/tickets?priority=OMEGA');
      expect(priorityResponse.ok()).toBeTruthy();
      const { tickets: priorityTickets } = await priorityResponse.json();
      expect(priorityTickets.every((t: any) => t.priority === 'OMEGA')).toBeTruthy();

      // Test filtering by type
      const typeResponse = await request.get('/api/tickets?type=EQUIPMENT');
      expect(typeResponse.ok()).toBeTruthy();
      const { tickets: typeTickets } = await typeResponse.json();
      expect(typeTickets.every((t: any) => t.type === 'EQUIPMENT')).toBeTruthy();

      // Test search
      const searchResponse = await request.get('/api/tickets?search=maintenance');
      expect(searchResponse.ok()).toBeTruthy();
      const { tickets: searchTickets } = await searchResponse.json();
      expect(searchTickets.some((t: any) => t.description.includes('maintenance'))).toBeTruthy();
    });

    test('can delete tickets', async ({ request }) => {
      // First create a ticket
      const createResponse = await request.post('/api/tickets', {
        data: {
          title: 'Ticket to delete',
          description: 'This should be deletable',
          type: 'MISSION',
          priority: 'BETA',
        },
      });
      expect(createResponse.ok()).toBeTruthy();
      const createdTicket = await createResponse.json();

      // Delete it
      const deleteResponse = await request.delete(`/api/tickets/${createdTicket.id}`);
      expect(deleteResponse.status()).toBe(204);

      // Verify it's gone
      const getResponse = await request.get(`/api/tickets/${createdTicket.id}`);
      expect(getResponse.status()).toBe(404);
    });

    test('can update any ticket', async ({ request }) => {
      // First create a ticket as a hero
      const createResponse = await request.post('/api/tickets', {
        data: {
          title: 'Hero Ticket',
          description: 'Created by hero',
          type: 'MISSION',
          priority: 'BETA',
        },
      });
      expect(createResponse.ok()).toBeTruthy();
      const createdTicket = await createResponse.json();

      // Update it as support staff
      const updateResponse = await request.patch(`/api/tickets/${createdTicket.id}`, {
        data: {
          status: 'IN_PROGRESS',
          priority: 'ALPHA',
        },
      });
      expect(updateResponse.ok()).toBeTruthy();
      const updatedTicket = await updateResponse.json();
      expect(updatedTicket.status).toBe('IN_PROGRESS');
      expect(updatedTicket.priority).toBe('ALPHA');
    });
  });
}); 