"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { createImpactEffect } from '@/lib/animations/utils';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const TEST_ACCOUNTS = {
  support: {
    email: 'test_support@cape.dev',
    password: 'test_support123',
  },
  hero: {
    email: 'test_hero@cape.dev',
    password: 'test_hero123',
  },
};

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const supabase = createClientComponentClient<Database>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleQuickAccess = (role: 'support' | 'hero') => {
    // Navigate directly to the dashboard
    window.location.href = `/dashboard/${role}`;
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setError('');
      
      // Sign in
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (signInError) {
        throw signInError;
      }

      if (data?.user) {
        // Check if MFA is required
        if (data.user.factors && data.user.factors.length > 0) {
          router.push('/login/mfa');
          return;
        }

        setShowSuccess(true);

        // Get user's role from profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          throw new Error('Failed to fetch user profile');
        }

        if (!profile?.role) {
          throw new Error('No role found in profile');
        }

        // Redirect based on role
        const role = profile.role.toLowerCase();
        
        // Use router.refresh() to trigger a server-side revalidation
        router.refresh();
        
        // Then navigate to the dashboard
        router.push(`/dashboard/${role}`);
      }
    } catch (err) {
      setShowSuccess(false);
      setError(err instanceof Error ? err.message : 'Invalid credentials');
    }
  };

  return (
    <div className="relative">
      {/* Success Effect */}
      {showSuccess && (
        <motion.div
          className="absolute inset-0 bg-effect-starburst rounded-lg"
          data-testid="success-effect"
          variants={createImpactEffect(2)}
          initial="initial"
          animate="animate"
        />
      )}

      {/* Quick Access Buttons */}
      <div className="mb-8 space-y-4">
        <Button
          type="button"
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="lg"
          onClick={() => handleQuickAccess('support')}
        >
          Quick Access: Support Dashboard
        </Button>
        <Button
          type="button"
          className="w-full bg-purple-600 hover:bg-purple-700"
          size="lg"
          onClick={() => handleQuickAccess('hero')}
        >
          Quick Access: Hero Dashboard
        </Button>
      </div>

      <div className="relative py-4 flex items-center">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="flex-shrink mx-4 text-gray-400">or use the form below</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your email"
                    {...field}
                    className="font-comic-secondary"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    {...field}
                    className="font-comic-secondary"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && (
            <div
              role="alert"
              className="p-2 text-sm text-red-500 bg-red-100 rounded"
            >
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full font-comic"
              size="lg"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Accessing...' : 'Enter HQ'}
            </Button>

            <div className="flex justify-between text-sm">
              <Link
                href="/register"
                className="text-primary hover:underline font-comic-secondary"
              >
                Request Access
              </Link>
              <Link
                href="/forgot-password"
                className="text-primary hover:underline font-comic-secondary"
              >
                Forgot Password?
              </Link>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
} 