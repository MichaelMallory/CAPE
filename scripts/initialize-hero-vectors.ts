import { createClient } from '@supabase/supabase-js';
import { updateAllHeroVectors } from '../app/utils/pinecone-client';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
const envPath = resolve(process.cwd(), '.env.local');
console.log('Loading environment from:', envPath);
dotenv.config({ path: envPath });

// Debug environment variables
console.log('Environment variables loaded:');
console.log('PINECONE_API_KEY exists:', !!process.env.PINECONE_API_KEY);
console.log('PINECONE_INDEX:', process.env.PINECONE_INDEX);
console.log('NEXT_PUBLIC_SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);

async function initializeHeroVectors() {
  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    console.log('Fetching heroes from database...');
    const { data: heroes, error } = await supabase
      .from('profiles')
      .select('id, codename, powers')
      .eq('role', 'HERO');

    if (error) throw error;
    if (!heroes || heroes.length === 0) {
      console.log('No heroes found in database');
      return;
    }

    console.log(`Found ${heroes.length} heroes. Creating vector embeddings...`);
    await updateAllHeroVectors(heroes);
    console.log('Vector embeddings created successfully!');

  } catch (error) {
    console.error('Error initializing hero vectors:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeHeroVectors()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Initialization failed:', error);
    process.exit(1);
  }); 