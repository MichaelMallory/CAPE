import { test, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../.auth/hero.json');
const supportAuthFile = path.join(__dirname, '../.auth/support-staff.json');

test.describe('Comment System', () => {
  let ticketId: string;

  test.describe('as a hero', () => {
    test.use({ storageState: authFile });

    test.beforeEach(async ({ request }) => {
      // Create a test ticket
      const response = await request.post('/api/tickets', {
        data: {
          title: 'Test Ticket for Comments',
          description: 'Testing the comment system',
          type: 'MISSION',
          priority: 'BETA',
        },
      });
      expect(response.ok()).toBeTruthy();
      const ticket = await response.json();
      ticketId = ticket.id;
    });

    test('can create a comment on own ticket', async ({ request }) => {
      const response = await request.post(`/api/tickets/${ticketId}/comments`, {
        data: {
          content: 'This is a test comment',
        },
      });

      expect(response.ok()).toBeTruthy();
      const comment = await response.json();
      expect(comment).toHaveProperty('id');
      expect(comment.content).toBe('This is a test comment');
      expect(comment.author).toHaveProperty('codename');
    });

    test('can reply to a comment', async ({ request }) => {
      // First create a parent comment
      const parentResponse = await request.post(`/api/tickets/${ticketId}/comments`, {
        data: {
          content: 'Parent comment',
        },
      });
      expect(parentResponse.ok()).toBeTruthy();
      const parentComment = await parentResponse.json();

      // Then create a reply
      const replyResponse = await request.post(`/api/tickets/${ticketId}/comments`, {
        data: {
          content: 'Reply to parent',
          parent_id: parentComment.id,
        },
      });
      expect(replyResponse.ok()).toBeTruthy();
      const reply = await replyResponse.json();
      expect(reply.parent_id).toBe(parentComment.id);
    });

    test('can mention other heroes in comments', async ({ request }) => {
      // First get a list of heroes to mention
      const heroesResponse = await request.get('/api/heroes');
      expect(heroesResponse.ok()).toBeTruthy();
      const { heroes } = await heroesResponse.json();
      const heroToMention = heroes[0];

      // Create a comment with a mention
      const response = await request.post(`/api/tickets/${ticketId}/comments`, {
        data: {
          content: `Hey @[${heroToMention.codename}](${heroToMention.id}), can you help with this?`,
          mentioned_heroes: [heroToMention.id],
        },
      });

      expect(response.ok()).toBeTruthy();
      const comment = await response.json();
      expect(comment.content).toContain(heroToMention.codename);

      // Check that a notification was created
      const notificationsResponse = await request.get('/api/notifications');
      expect(notificationsResponse.ok()).toBeTruthy();
      const { notifications } = await notificationsResponse.json();
      expect(notifications.some((n: any) => 
        n.type === 'MENTION' && 
        n.comment_id === comment.id &&
        n.recipient_id === heroToMention.id
      )).toBeTruthy();
    });

    test('can view comments with pagination', async ({ request }) => {
      // Create multiple comments
      for (let i = 0; i < 30; i++) {
        await request.post(`/api/tickets/${ticketId}/comments`, {
          data: {
            content: `Comment ${i + 1}`,
          },
        });
      }

      // Get first page
      const firstPageResponse = await request.get(`/api/tickets/${ticketId}/comments?page=1&limit=10`);
      expect(firstPageResponse.ok()).toBeTruthy();
      const firstPage = await firstPageResponse.json();
      expect(firstPage.comments).toHaveLength(10);
      expect(firstPage.pagination.total).toBeGreaterThanOrEqual(30);

      // Get second page
      const secondPageResponse = await request.get(`/api/tickets/${ticketId}/comments?page=2&limit=10`);
      expect(secondPageResponse.ok()).toBeTruthy();
      const secondPage = await secondPageResponse.json();
      expect(secondPage.comments).toHaveLength(10);
      expect(secondPage.comments[0].id).not.toBe(firstPage.comments[0].id);
    });
  });

  test.describe('as support staff', () => {
    test.use({ storageState: supportAuthFile });

    test('can view and comment on any ticket', async ({ request }) => {
      // Create a comment on the ticket
      const response = await request.post(`/api/tickets/${ticketId}/comments`, {
        data: {
          content: 'Support staff comment',
        },
      });

      expect(response.ok()).toBeTruthy();
      const comment = await response.json();
      expect(comment.content).toBe('Support staff comment');
    });

    test('can view comment threads', async ({ request }) => {
      // Create a parent comment
      const parentResponse = await request.post(`/api/tickets/${ticketId}/comments`, {
        data: {
          content: 'Parent thread comment',
        },
      });
      const parentComment = await parentResponse.json();

      // Create multiple replies
      for (let i = 0; i < 3; i++) {
        await request.post(`/api/tickets/${ticketId}/comments`, {
          data: {
            content: `Reply ${i + 1}`,
            parent_id: parentComment.id,
          },
        });
      }

      // Get comments with their replies
      const response = await request.get(`/api/tickets/${ticketId}/comments`);
      expect(response.ok()).toBeTruthy();
      const { comments } = await response.json();
      const thread = comments.find((c: any) => c.id === parentComment.id);
      expect(thread).toBeDefined();
      expect(thread.replies).toHaveLength(3);
    });

    test('notifications are created for mentions and replies', async ({ request }) => {
      // Get a hero to mention
      const heroesResponse = await request.get('/api/heroes');
      const { heroes } = await heroesResponse.json();
      const heroToMention = heroes[0];

      // Create a comment with a mention
      const commentResponse = await request.post(`/api/tickets/${ticketId}/comments`, {
        data: {
          content: `@[${heroToMention.codename}](${heroToMention.id}) please review this`,
          mentioned_heroes: [heroToMention.id],
        },
      });
      const comment = await commentResponse.json();

      // Create a reply
      await request.post(`/api/tickets/${ticketId}/comments`, {
        data: {
          content: 'A reply to the comment',
          parent_id: comment.id,
        },
      });

      // Check notifications
      const notificationsResponse = await request.get('/api/notifications');
      const { notifications } = await notificationsResponse.json();
      
      // Should have both a mention and a reply notification
      expect(notifications.some((n: any) => n.type === 'MENTION')).toBeTruthy();
      expect(notifications.some((n: any) => n.type === 'REPLY')).toBeTruthy();
    });
  });
}); 