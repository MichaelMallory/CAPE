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
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters'),
});

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClientComponentClient<Database>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setError('');
      setIsSubmitting(true);
      console.log('Attempting login with:', values.email);
      
      // Sign in
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        setIsSubmitting(false);
        throw signInError;
      }

      if (data?.user) {
        console.log('User authenticated:', data.user.id);
        
        // Check if MFA is required
        if (data.user.factors && data.user.factors.length > 0) {
          console.log('MFA required, redirecting to MFA page');
          setIsSubmitting(false);
          router.push('/login/mfa');
          return;
        }

        setShowSuccess(true);

        // Get user's role from profile
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id);

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          setIsSubmitting(false);
          throw new Error('Failed to fetch user profile');
        }

        if (!profiles || profiles.length === 0) {
          console.error('No profile found for user:', data.user.id);
          setIsSubmitting(false);
          throw new Error('No profile found');
        }

        const profile = profiles[0];
        console.log('User role:', profile.role);

        // Update user metadata with role
        const { error: updateError } = await supabase.auth.updateUser({
          data: { role: profile.role }
        });

        if (updateError) {
          console.error('Failed to update user metadata:', updateError);
          setIsSubmitting(false);
          throw updateError;
        }

        // Ensure session is set before navigation
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session) {
          throw new Error('Session not established');
        }

        // Use router.refresh() to trigger a server-side revalidation
        await router.refresh();
        
        // Small delay to ensure session is propagated
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Then navigate to the dashboard
        const role = profile.role.toLowerCase();
        console.log('Redirecting to dashboard:', role);
        router.push(`/dashboard/${role}`);
        
        // Only disable loading state after navigation starts
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setShowSuccess(false);
      setError(err instanceof Error ? err.message : 'Invalid login credentials');
      setIsSubmitting(false);
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
              className="p-2 text-sm text-red-500 bg-red-100 rounded"
              data-testid="error-message"
            >
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full font-comic"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Accessing...' : 'Enter HQ'}
            </Button>

            <div className="flex justify-center text-sm">
              <Link
                href="/register"
                className="text-primary hover:underline font-comic-secondary"
              >
                Request Access
              </Link>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
} 