import { Metadata } from 'next'
import { ForgotPasswordForm } from './forgot-password-form'

export const metadata: Metadata = {
  title: 'Reset Password | CAPE HQ',
  description: 'Reset your CAPE HQ account password.',
}

export default function ForgotPasswordPage() {
  return (
    <div className="container max-w-lg mx-auto py-8">
      <h1 className="text-3xl font-comic mb-8 text-center">Reset Your Password</h1>
      <p className="text-center mb-8 text-muted-foreground font-comic-secondary">
        Enter your email address and we'll send you instructions to reset your password.
      </p>
      <ForgotPasswordForm />
    </div>
  )
} 