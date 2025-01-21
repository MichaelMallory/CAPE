import { Metadata } from 'next'
import { ResetPasswordForm } from './reset-password-form'

export const metadata: Metadata = {
  title: 'Set New Password | CAPE HQ',
  description: 'Set a new password for your CAPE HQ account.',
}

export default function ResetPasswordPage() {
  return (
    <div className="container max-w-lg mx-auto py-8">
      <h1 className="text-3xl font-comic mb-8 text-center">Set New Password</h1>
      <p className="text-center mb-8 text-muted-foreground font-comic-secondary">
        Please enter your new password below.
      </p>
      <ResetPasswordForm />
    </div>
  )
} 