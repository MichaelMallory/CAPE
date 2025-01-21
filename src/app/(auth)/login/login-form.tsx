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
import { supabase } from '@/lib/supabase/client';

const formSchema = z.object({
  codename: z.string().min(1, 'Codename is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      codename: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: `${values.codename.toLowerCase()}@heroes.cape`,
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
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      }
    } catch (err) {
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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="codename"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Codename</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your hero codename"
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