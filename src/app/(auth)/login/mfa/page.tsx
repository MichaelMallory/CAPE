import { Metadata } from 'next';
import { MFAForm } from './mfa-form';
import { AnimatedPanel } from '@/components/ui/animated-panel';

export const metadata: Metadata = {
  title: 'Security Check | CAPE HQ',
  description: 'Verify your identity to access CAPE HQ',
};

export default function MFAPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-comic text-center text-foreground">
            Security Check
          </h1>
          <p className="mt-2 text-center text-muted-foreground font-comic-secondary">
            Enter the verification code sent to your device
          </p>
        </div>

        <AnimatedPanel direction="bottom" className="w-full">
          <MFAForm />
        </AnimatedPanel>
      </div>
    </main>
  );
} 