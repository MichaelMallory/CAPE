import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from './providers'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'C.A.P.E - Central Agency for Powered Entities',
  description: 'Superhero support and management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-screen antialiased`}>
        <AuthProvider>
          <div className="relative min-h-screen">
            {children}
            <Toaster />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
} 