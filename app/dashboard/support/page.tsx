import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';
import SupportDashboardClient from './support-dashboard-client';
import { Database } from '@/lib/database.types';

export default async function SupportDashboardPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // Verify user has support role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (!profile?.role || profile.role.toLowerCase() !== 'support') {
    redirect('/dashboard');
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6">
        <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          Mission Control Center
        </h1>
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="animate-pulse text-xl text-gray-400">
            Loading dashboard...
          </div>
        </div>
      </div>
    }>
      <SupportDashboardClient />
    </Suspense>
  );
} 