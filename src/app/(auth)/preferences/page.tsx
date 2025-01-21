import React from 'react';
import { PreferencesForm } from './preferences-form';

export default function PreferencesPage() {
  return (
    <div className="container py-10">
      <h1 className="text-4xl font-comic text-center mb-8">Hero Preferences</h1>
      <PreferencesForm />
    </div>
  );
} 