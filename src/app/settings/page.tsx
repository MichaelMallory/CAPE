import React from 'react';
import { SettingsPanel } from '@/components/settings/settings-panel';

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-background py-8">
      <div className="container mx-auto">
        <SettingsPanel />
      </div>
    </main>
  );
} 