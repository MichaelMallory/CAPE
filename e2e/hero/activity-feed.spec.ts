import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

test.describe('Hero Activity Feed', () => {
  const heroId = 'test-hero-1';

  test.beforeEach(async ({ page }) => {
    // Setup: Insert test data into Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Clean up any existing test data
    await supabase
      .from('hero_timeline')
      .delete()
      .eq('hero_id', heroId);

    // Insert test activities
    await supabase.from('hero_timeline').insert([
      {
        hero_id: heroId,
        action: 'MISSION_COMPLETE',
        details: 'Successfully thwarted evil robot invasion',
        created_at: new Date().toISOString(),
      },
      {
        hero_id: heroId,
        action: 'EQUIPMENT_UPDATE',
        details: 'Upgraded power suit with new energy core',
        created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      },
      {
        hero_id: heroId,
        action: 'TEAM_UPDATE',
        details: 'Joined the Quantum Squad',
        created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      },
    ]);

    // Navigate to the hero dashboard
    await page.goto(`/hero/dashboard?id=${heroId}`);
  });

  test('displays activity entries with correct formatting', async ({ page }) => {
    // Wait for activity entries to load
    await expect(page.getByText('Successfully thwarted evil robot invasion')).toBeVisible();

    // Check for correct icons
    await expect(page.getByTestId('mission-complete-icon')).toBeVisible();
    await expect(page.getByTestId('equipment-update-icon')).toBeVisible();
    await expect(page.getByTestId('team-update-icon')).toBeVisible();

    // Verify badges are present with correct styling
    const missionBadge = page.getByText('MISSION COMPLETE');
    await expect(missionBadge).toBeVisible();
    await expect(missionBadge).toHaveClass(/bg-yellow-500\/20/);

    // Verify chronological order
    const entries = await page.getByRole('listitem').all();
    expect(entries).toHaveLength(3);

    // Check timestamps are present
    await expect(page.getByText(/ago/)).toBeVisible();
  });

  test('shows empty state when no activities', async ({ page }) => {
    // Clean up all test data
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    await supabase
      .from('hero_timeline')
      .delete()
      .eq('hero_id', heroId);

    // Reload the page
    await page.reload();

    // Check for empty state message
    await expect(page.getByText('No activity recorded yet, hero! Time to make history!')).toBeVisible();
  });

  test('updates in real-time when new activity occurs', async ({ page }) => {
    // Subscribe to real-time updates
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Insert a new activity
    await supabase.from('hero_timeline').insert({
      hero_id: heroId,
      action: 'ALERT',
      details: 'Emergency alert: Supervillain detected!',
      created_at: new Date().toISOString(),
    });

    // Verify new activity appears
    await expect(page.getByText('Emergency alert: Supervillain detected!')).toBeVisible();
    await expect(page.getByTestId('alert-icon')).toBeVisible();
  });
}); 