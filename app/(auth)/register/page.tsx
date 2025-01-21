import { Metadata } from 'next'
import { RegisterPageClient } from './register-client'

export const metadata: Metadata = {
  title: 'Register | CAPE HQ',
  description: 'Join the ranks of heroes at CAPE HQ',
}

export default function RegisterPage() {
  return <RegisterPageClient />
} 