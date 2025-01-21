import { test, expect } from '@playwright/test';
import path from 'path';

const adminAuthFile = path.join(__dirname, '../.auth/admin.json');
const userAuthFile = path.join(__dirname, '../.auth/user.json');

test.describe('Profile Management API', () => {
  test.describe('CRUD Operations', () => {
    test.use({ storageState: userAuthFile });

    test('can fetch own profile', async ({ request }) => {
      const response = await request.get('/api/profile');
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data).toHaveProperty('codename');
      expect(data).toHaveProperty('status');
      expect(data).toHaveProperty('clearance_level');
      expect(data).toHaveProperty('team_affiliations');
    });

    test('can update profile information', async ({ request }) => {
      const updates = {
        notification_preferences: {
          mission_updates: true,
          equipment_alerts: false,
          team_changes: true
        },
        accessibility_settings: {
          reduce_motion: true,
          high_contrast: false
        }
      };

      const response = await request.patch('/api/profile', { data: updates });
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.notification_preferences).toEqual(updates.notification_preferences);
      expect(data.accessibility_settings).toEqual(updates.accessibility_settings);
    });

    test('can upload avatar', async ({ request }) => {
      // Create a test image buffer
      const imageBuffer = Buffer.from('fake-image-data');
      
      const response = await request.post('/api/profile/avatar', {
        multipart: {
          file: {
            name: 'avatar.png',
            mimeType: 'image/png',
            buffer: imageBuffer
          }
        }
      });
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data).toHaveProperty('avatar_url');
      expect(data.avatar_url).toContain('avatars/');
    });
  });

  test.describe('Admin Operations', () => {
    test.use({ storageState: adminAuthFile });

    test('can fetch any user profile', async ({ request }) => {
      const response = await request.get('/api/profiles/123');
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('codename');
    });

    test('can update user status', async ({ request }) => {
      const response = await request.patch('/api/profiles/123/status', {
        data: { status: 'INACTIVE' }
      });
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.status).toBe('INACTIVE');
    });

    test('can manage team affiliations', async ({ request }) => {
      const response = await request.post('/api/profiles/123/teams', {
        data: {
          teams: ['Alpha Squad', 'Response Team']
        }
      });
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.team_affiliations).toContain('Alpha Squad');
      expect(data.team_affiliations).toContain('Response Team');
    });
  });

  test.describe('Validation & Security', () => {
    test.use({ storageState: userAuthFile });

    test('cannot access other user profiles', async ({ request }) => {
      const response = await request.get('/api/profiles/123');
      expect(response.status()).toBe(403);
    });

    test('validates profile update data', async ({ request }) => {
      const response = await request.patch('/api/profile', {
        data: {
          clearance_level: 999 // Invalid level
        }
      });
      expect(response.status()).toBe(400);
      
      const error = await response.json();
      expect(error).toHaveProperty('message');
    });

    test('validates file uploads', async ({ request }) => {
      const response = await request.post('/api/profile/avatar', {
        multipart: {
          file: {
            name: 'large.png',
            mimeType: 'image/png',
            buffer: Buffer.alloc(10 * 1024 * 1024) // 10MB file
          }
        }
      });
      expect(response.status()).toBe(400);
      
      const error = await response.json();
      expect(error.message).toContain('file size');
    });
  });
}); 