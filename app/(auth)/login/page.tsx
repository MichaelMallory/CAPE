"use client"

import Image from 'next/image'
import { LoginForm } from './login-form'
import { AnimatedPanel } from '@/components/ui/animated-panel'

export default function LoginPage() {
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
            Welcome to CAPE HQ
          </h1>
          <p className="mt-2 text-center text-muted-foreground font-comic-secondary">
            Your mission control awaits, hero
          </p>
        </div>

        {/* Login Form Panel */}
        <AnimatedPanel
          data-testid="login-panel"
          direction="bottom"
          className="w-full"
        >
          <LoginForm />
        </AnimatedPanel>
      </div>
    </main>
  )
} 