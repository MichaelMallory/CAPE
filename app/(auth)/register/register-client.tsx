"use client"

import Image from 'next/image'
import { RegistrationForm } from './registration-form'
import { AnimatedPanel } from '@/components/ui/animated-panel'

export function RegisterPageClient() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Title */}
        <div className="flex flex-col items-center">
          <Image
            src="/logo.svg"
            alt="CAPE Logo"
            width={120}
            height={120}
            className="mb-4"
            priority
          />
          <h1 className="text-4xl font-comic text-center text-foreground">
            Join CAPE HQ
          </h1>
          <p className="mt-2 text-center text-muted-foreground font-comic-secondary">
            Begin your journey as a hero
          </p>
        </div>

        {/* Registration Form Panel */}
        <AnimatedPanel
          data-testid="registration-panel"
          direction="bottom"
          className="w-full"
        >
          <RegistrationForm />
        </AnimatedPanel>
      </div>
    </main>
  )
} 