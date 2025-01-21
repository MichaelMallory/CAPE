import React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createImpactEffect } from '@/lib/animations/utils'
import { supabase } from '@/lib/supabase/client'

const roleSchema = z.enum(['HERO', 'SUPPORT', 'ADMIN'])

const formSchema = z.object({
  codename: z.string().min(3, 'Codename must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
  role: roleSchema,
  realName: z.string().optional(),
  powers: z.string().optional(),
  clearanceLevel: z.number().min(1).max(10).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type RegistrationStep = 'CREDENTIALS' | 'ROLE' | 'PROFILE'

export function RegistrationForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('CREDENTIALS')
  const [error, setError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      codename: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'HERO',
      realName: '',
      powers: '',
      clearanceLevel: 1,
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            codename: values.codename,
            role: values.role,
          },
        },
      })

      if (authError) throw authError

      // Create the profile
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            codename: values.codename,
            real_name: values.realName || null,
            powers: values.powers ? [values.powers] : [],
            clearance_level: values.clearanceLevel || 1,
            team_affiliations: [],
            status: 'ACTIVE',
          })

        if (profileError) throw profileError
      }

      setShowSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    }
  }

  const nextStep = () => {
    switch (currentStep) {
      case 'CREDENTIALS':
        if (form.formState.errors.codename || form.formState.errors.email || 
            form.formState.errors.password || form.formState.errors.confirmPassword) {
          return
        }
        setCurrentStep('ROLE')
        break
      case 'ROLE':
        if (form.formState.errors.role) return
        setCurrentStep('PROFILE')
        break
      case 'PROFILE':
        form.handleSubmit(onSubmit)()
        break
    }
  }

  const prevStep = () => {
    switch (currentStep) {
      case 'ROLE':
        setCurrentStep('CREDENTIALS')
        break
      case 'PROFILE':
        setCurrentStep('ROLE')
        break
    }
  }

  return (
    <div className="relative">
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
        <form className="space-y-6">
          <div className="flex justify-between mb-6">
            <div className="space-x-1">
              <span className={`h-2 w-2 rounded-full inline-block ${currentStep === 'CREDENTIALS' ? 'bg-primary' : 'bg-gray-300'}`} />
              <span className={`h-2 w-2 rounded-full inline-block ${currentStep === 'ROLE' ? 'bg-primary' : 'bg-gray-300'}`} />
              <span className={`h-2 w-2 rounded-full inline-block ${currentStep === 'PROFILE' ? 'bg-primary' : 'bg-gray-300'}`} />
            </div>
            <span className="text-sm text-gray-500 font-comic-secondary">
              Step {currentStep === 'CREDENTIALS' ? '1' : currentStep === 'ROLE' ? '2' : '3'} of 3
            </span>
          </div>

          {currentStep === 'CREDENTIALS' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <FormField
                control={form.control}
                name="codename"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Codename</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your hero codename" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter your email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Create a password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirm your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
          )}

          {currentStep === 'ROLE' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="HERO">Hero</SelectItem>
                        <SelectItem value="SUPPORT">Support Staff</SelectItem>
                        <SelectItem value="ADMIN">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
          )}

          {currentStep === 'PROFILE' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <FormField
                control={form.control}
                name="realName"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Real Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your real name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="powers"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Powers (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="List your superpowers" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clearanceLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clearance Level</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
          )}

          {error && (
            <div
              role="alert"
              className="p-2 text-sm text-red-500 bg-red-100 rounded"
            >
              {error}
            </div>
          )}

          <div className="flex justify-between gap-4">
            {currentStep !== 'CREDENTIALS' && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="flex-1"
              >
                Back
              </Button>
            )}
            <Button
              type="button"
              onClick={nextStep}
              className="flex-1"
              disabled={form.formState.isSubmitting}
            >
              {currentStep === 'PROFILE'
                ? form.formState.isSubmitting
                  ? 'Creating Account...'
                  : 'Create Account'
                : 'Next'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
} 