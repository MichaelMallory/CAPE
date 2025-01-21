import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

test.describe('Dashboard Metrics', () => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  test.beforeEach(async () => {
    // Clean up existing test data
    await Promise.all([
      supabase.from('heroes').delete().neq('id', ''),
      supabase.from('missions').delete().neq('id', ''),
      supabase.from('equipment').delete().neq('id', ''),
      supabase.from('tickets').delete().neq('id', ''),
      supabase.from('alerts').delete().neq('id', ''),
    ]);

    // Insert test data
    await Promise.all([
      // Insert test heroes
      supabase.from('heroes').insert([
        {
          id: 'test-hero-1',
          codename: 'Test Hero 1',
          status: 'ACTIVE',
          clearance_level: 3,
          powers: ['flight', 'strength'],
          team_affiliations: ['Alpha Team'],
        },
        {
          id: 'test-hero-2',
          codename: 'Test Hero 2',
          status: 'INACTIVE',
          clearance_level: 2,
          powers: ['speed', 'agility'],
          team_affiliations: ['Beta Team'],
        },
      ]),

      // Insert test missions
      supabase.from('missions').insert([
        {
          id: 'test-mission-1',
          name: 'Test Mission 1',
          status: 'ACTIVE',
          threat_level: 4,
          assigned_heroes: ['test-hero-1'],
        },
        {
          id: 'test-mission-2',
          name: 'Test Mission 2',
          status: 'COMPLETED',
          threat_level: 3,
          assigned_heroes: ['test-hero-2'],
        },
      ]),

      // Insert test equipment
      supabase.from('equipment').insert([
        {
          id: 'test-equipment-1',
          name: 'Test Equipment 1',
          status: 'OPERATIONAL',
          type: 'weapon',
          assigned_to: 'test-hero-1',
        },
        {
          id: 'test-equipment-2',
          name: 'Test Equipment 2',
          status: 'MAINTENANCE',
          type: 'armor',
          assigned_to: 'test-hero-2',
        },
        {
          id: 'test-equipment-3',
          name: 'Test Equipment 3',
          status: 'DAMAGED',
          type: 'vehicle',
          assigned_to: null,
        },
      ]),

      // Insert test tickets
      supabase.from('tickets').insert([
        {
          id: 'test-ticket-1',
          title: 'Test Ticket 1',
          priority: 'OMEGA',
          status: 'NEW',
          type: 'MISSION',
          hero: 'test-hero-1',
          created_at: new Date().toISOString(),
        },
        {
          id: 'test-ticket-2',
          title: 'Test Ticket 2',
          priority: 'ALPHA',
          status: 'RESOLVED',
          type: 'EQUIPMENT',
          hero: 'test-hero-2',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          resolved_at: new Date().toISOString(),
        },
      ]),

      // Insert test alerts
      supabase.from('alerts').insert([
        {
          id: 'test-alert-1',
          title: 'Test Alert 1',
          severity: 'HIGH',
          status: 'ACTIVE',
          source: 'system',
          affected_heroes: ['test-hero-1'],
          created_at: new Date().toISOString(),
        },
      ]),
    ]);
  });

  test('returns correct metrics', async ({ request }) => {
    const response = await request.get('/api/dashboard-metrics');
    expect(response.ok()).toBeTruthy();

    const metrics = await response.json();

    // Check active heroes count
    expect(metrics.activeHeroes).toBe(1);

    // Check active missions count
    expect(metrics.activeMissions).toBe(1);

    // Check equipment status
    expect(metrics.equipmentStatus).toEqual({
      operational: 1,
      maintenance: 1,
      damaged: 1,
    });

    // Check ticket metrics
    expect(metrics.ticketMetrics.total).toBe(2);
    expect(metrics.ticketMetrics.byPriority).toEqual({
      OMEGA: 1,
      ALPHA: 1,
    });
    expect(metrics.ticketMetrics.byStatus).toEqual({
      NEW: 1,
      RESOLVED: 1,
    });
    expect(typeof metrics.ticketMetrics.averageResolutionTime).toBe('number');

    // Check recent activity
    expect(metrics.recentActivity.missions).toBe(2);
    expect(metrics.recentActivity.equipment).toBe(3);
    expect(metrics.recentActivity.alerts).toBe(1);
  });

  test('caches metrics and serves stale data while revalidating', async ({ request }) => {
    // First request - should be uncached
    const start = Date.now();
    const response1 = await request.get('/api/dashboard-metrics');
    const duration1 = Date.now() - start;
    expect(response1.ok()).toBeTruthy();
    const metrics1 = await response1.json();

    // Second request within TTL - should be cached and fast
    const start2 = Date.now();
    const response2 = await request.get('/api/dashboard-metrics');
    const duration2 = Date.now() - start2;
    expect(response2.ok()).toBeTruthy();
    const metrics2 = await response2.json();

    // Verify metrics are identical
    expect(metrics2).toEqual(metrics1);

    // Verify second request was faster (cached)
    expect(duration2).toBeLessThan(duration1);

    // Wait for TTL to expire but within stale-while-revalidate window
    await new Promise(resolve => setTimeout(resolve, 31000));

    // Third request - should serve stale data quickly while revalidating
    const start3 = Date.now();
    const response3 = await request.get('/api/dashboard-metrics');
    const duration3 = Date.now() - start3;
    expect(response3.ok()).toBeTruthy();
    const metrics3 = await response3.json();

    // Verify metrics are still the same (stale data)
    expect(metrics3).toEqual(metrics1);

    // Verify response was still fast despite TTL expiry
    expect(duration3).toBeLessThan(duration1);
  });

  test('updates metrics in real-time when data changes', async ({ request }) => {
    // Get initial metrics
    const response1 = await request.get('/api/dashboard-metrics');
    const metrics1 = await response1.json();

    // Update a hero's status
    await supabase
      .from('heroes')
      .update({ status: 'ACTIVE' })
      .eq('id', 'test-hero-2');

    // Wait for cache invalidation and revalidation
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get updated metrics
    const response2 = await request.get('/api/dashboard-metrics');
    const metrics2 = await response2.json();

    // Verify active heroes count increased
    expect(metrics2.activeHeroes).toBe(metrics1.activeHeroes + 1);

    // Update equipment status
    await supabase
      .from('equipment')
      .update({ status: 'DAMAGED' })
      .eq('id', 'test-equipment-1');

    // Wait for cache invalidation and revalidation
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get updated metrics
    const response3 = await request.get('/api/dashboard-metrics');
    const metrics3 = await response3.json();

    // Verify equipment status counts updated
    expect(metrics3.equipmentStatus.operational).toBe(metrics2.equipmentStatus.operational - 1);
    expect(metrics3.equipmentStatus.damaged).toBe(metrics2.equipmentStatus.damaged + 1);

    // Create a new alert
    await supabase
      .from('alerts')
      .insert([{
        id: 'test-alert-2',
        title: 'Test Alert 2',
        severity: 'MEDIUM',
        status: 'ACTIVE',
        source: 'system',
        affected_heroes: ['test-hero-2'],
        created_at: new Date().toISOString(),
      }]);

    // Wait for cache invalidation and revalidation
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get updated metrics
    const response4 = await request.get('/api/dashboard-metrics');
    const metrics4 = await response4.json();

    // Verify recent activity count increased
    expect(metrics4.recentActivity.alerts).toBe(metrics3.recentActivity.alerts + 1);
  });

  test('handles errors gracefully', async ({ request }) => {
    // Temporarily break database access by using invalid credentials
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'invalid-key';

    const response = await request.get('/api/dashboard-metrics');
    expect(response.status()).toBe(500);

    const error = await response.json();
    expect(error).toHaveProperty('error');
  });

  test.afterAll(async () => {
    // Clean up all test data
    await Promise.all([
      supabase.from('heroes').delete().neq('id', ''),
      supabase.from('missions').delete().neq('id', ''),
      supabase.from('equipment').delete().neq('id', ''),
      supabase.from('tickets').delete().neq('id', ''),
      supabase.from('alerts').delete().neq('id', ''),
    ]);
  });
}); 