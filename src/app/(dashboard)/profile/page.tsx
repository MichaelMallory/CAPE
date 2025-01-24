import React from 'react';
import { ComicPanel } from '@/components/ui/comic-panel';
import { ProfileForm } from './profile-form';

export default function ProfilePage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-comic mb-8 text-center">Hero Profile Management</h1>
      <ComicPanel title="Profile Settings" className="max-w-2xl mx-auto">
        <ProfileForm />
      </ComicPanel>
    </div>
  );
} 