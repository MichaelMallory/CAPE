import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@styles/globals.css';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CAPE - Superhero Support System',
  description: 'Centralized Assignment & Priority Equipment - A next-generation CRM system for superhero organizations',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
} 