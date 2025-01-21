import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with admin privileges
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createTestUsers() {
  try {
    // Create test support user
    const { data: supportUser, error: supportError } = await supabaseAdmin.auth.admin.createUser({
      email: 'test_support@cape.dev',
      password: 'test_support123',
      email_confirm: true,
      user_metadata: {
        role: 'SUPPORT'
      }
    });

    if (supportError) {
      console.error('Error creating support user:', supportError);
      return;
    }

    // Create support profile
    const { error: supportProfileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: supportUser.user.id,
        codename: 'Mission Control',
        real_name: 'Test Support',
        role: 'SUPPORT',
        status: 'ACTIVE',
        clearance_level: 5
      });

    if (supportProfileError) {
      console.error('Error creating support profile:', supportProfileError);
    }

    // Create test hero user
    const { data: heroUser, error: heroError } = await supabaseAdmin.auth.admin.createUser({
      email: 'test_hero@cape.dev',
      password: 'test_hero123',
      email_confirm: true,
      user_metadata: {
        role: 'HERO'
      }
    });

    if (heroError) {
      console.error('Error creating hero user:', heroError);
      return;
    }

    // Create hero profile
    const { error: heroProfileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: heroUser.user.id,
        codename: 'Test Hero',
        real_name: 'Test Hero Real Name',
        role: 'HERO',
        status: 'ACTIVE',
        clearance_level: 3
      });

    if (heroProfileError) {
      console.error('Error creating hero profile:', heroProfileError);
    }

    console.log('Test users created successfully!');
  } catch (error) {
    console.error('Error:', error);
  }
}

createTestUsers(); 