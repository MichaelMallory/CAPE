import { test, expect } from '@playwright/test';
import path from 'path';

const adminAuthFile = path.join(__dirname, '../.auth/admin.json');
const userAuthFile = path.join(__dirname, '../.auth/user.json');

test.describe('Admin User Management API', () => {
  test.describe('User Operations', () => {
    test.use({ storageState: adminAuthFile });

    test('can list all users with pagination', async ({ request }) => {
      const response = await request.get('/api/admin/users?page=1&limit=10');
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data).toHaveProperty('users');
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('page');
      expect(Array.isArray(data.users)).toBeTruthy();
    });

    test('can filter users by status and clearance level', async ({ request }) => {
      const response = await request.get('/api/admin/users?status=active&clearance_level=5');
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.users.every((user: any) => user.status === 'active')).toBeTruthy();
      expect(data.users.every((user: any) => user.clearance_level === 5)).toBeTruthy();
    });

    test('can search users by codename', async ({ request }) => {
      const response = await request.get('/api/admin/users?search=captain');
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.users.some((user: any) => 
        user.codename.toLowerCase().includes('captain')
      )).toBeTruthy();
    });

    test('can update user status', async ({ request }) => {
      const userId = 'test-user-id';
      const response = await request.patch(`/api/admin/users/${userId}`, {
        data: {
          status: 'suspended',
          reason: 'Violation of hero code'
        }
      });
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.status).toBe('suspended');
      
      // Verify audit log was created
      const auditResponse = await request.get(`/api/admin/audit-logs?target_id=${userId}`);
      expect(auditResponse.ok()).toBeTruthy();
      
      const auditData = await auditResponse.json();
      expect(auditData.logs.some((log: any) => 
        log.action === 'user_status_update' && 
        log.target_id === userId
      )).toBeTruthy();
    });

    test('can manage user teams', async ({ request }) => {
      const userId = 'test-user-id';
      const teams = ['Alpha Squad', 'Response Team'];
      
      const response = await request.post(`/api/admin/users/${userId}/teams`, {
        data: { teams }
      });
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.team_affiliations).toEqual(expect.arrayContaining(teams));
    });
  });

  test.describe('Security & Validation', () => {
    test.use({ storageState: userAuthFile });

    test('non-admin cannot access user management', async ({ request }) => {
      const response = await request.get('/api/admin/users');
      expect(response.status()).toBe(403);
    });

    test('validates user update data', async ({ request }) => {
      const response = await request.patch('/api/admin/users/test-user-id', {
        data: {
          clearance_level: 999 // Invalid level
        }
      });
      expect(response.status()).toBe(403); // Should be forbidden for non-admin
    });

    test('validates team assignments', async ({ request }) => {
      const response = await request.post('/api/admin/users/test-user-id/teams', {
        data: {
          teams: ['Invalid Team'] // Non-existent team
        }
      });
      expect(response.status()).toBe(403); // Should be forbidden for non-admin
    });
  });

  test.describe('Bulk Operations', () => {
    test.use({ storageState: adminAuthFile });

    test('can update multiple users status', async ({ request }) => {
      const userIds = ['user1', 'user2', 'user3'];
      const response = await request.patch('/api/admin/users/bulk', {
        data: {
          user_ids: userIds,
          status: 'inactive',
          reason: 'Team restructuring'
        }
      });
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.updated_count).toBe(userIds.length);
      
      // Verify audit logs were created for each user
      const auditResponse = await request.get('/api/admin/audit-logs');
      expect(auditResponse.ok()).toBeTruthy();
      
      const auditData = await auditResponse.json();
      userIds.forEach(userId => {
        expect(auditData.logs.some((log: any) => 
          log.action === 'bulk_user_status_update' && 
          log.target_id === userId
        )).toBeTruthy();
      });
    });

    test('can assign multiple users to team', async ({ request }) => {
      const userIds = ['user1', 'user2'];
      const team = 'Beta Squad';
      
      const response = await request.post('/api/admin/users/bulk/teams', {
        data: {
          user_ids: userIds,
          team
        }
      });
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.updated_count).toBe(userIds.length);
    });
  });
}); 