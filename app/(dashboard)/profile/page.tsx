'use client';

import { useAuth } from '@/hooks/use-auth';
import { ComicPanel } from '@/components/ui/comic-panel';
import { ComicBackground } from '@/components/ui/comic-background';
import { ProfileForm } from './profile-form';

export default function ProfilePage() {
  const { role } = useAuth();

  return (
    <>
      <ComicBackground variant="blue" />
      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-comic mb-8 text-center text-white">
          {role === 'HERO' ? 'Hero Profile' : 'Support Profile'} Management
        </h1>
        <ComicPanel 
          title="Profile Settings"
          className="max-w-2xl mx-auto"
        >
          <ProfileForm />
        </ComicPanel>
      </div>
    </>
  );
} 