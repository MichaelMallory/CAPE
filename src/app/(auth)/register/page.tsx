import { Metadata } from 'next'
import { RegistrationForm } from './registration-form'

export const metadata: Metadata = {
  title: 'Register | CAPE HQ',
  description: 'Join the ranks of heroes and support staff at CAPE HQ.',
}

export default function RegisterPage() {
  return (
    <div className="container max-w-lg mx-auto py-8">
      <h1 className="text-3xl font-comic mb-8 text-center">Join the Heroes</h1>
      <RegistrationForm />
    </div>
  )
} 