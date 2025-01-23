import { ReactNode } from 'react';

export default function SupportLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Support-specific navigation or context could be added here */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
} 