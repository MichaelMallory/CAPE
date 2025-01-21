"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import Link from 'next/link'
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
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: roleSchema,
  realName: z.string().default(''),
  powers: z.string().default(''),
  clearanceLevel: z.number().min(1).max(10).default(1),
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
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    mode: 'onChange',
  })

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    try {
      setIsSubmitting(true)
      setError('')
      const values = form.getValues()
      
      // First create the user account
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

      if (authError) {
        console.error('Auth error:', authError)
        throw authError
      }

      if (!authData?.user?.id) {
        throw new Error('Failed to create user account')
      }

      // Wait a moment for the session to be established
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Verify we have a session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        console.error('Session error:', sessionError)
        throw new Error('Failed to establish session')
      }

      // Create the profile in the profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          codename: values.codename,
          real_name: values.realName || null,
          role: values.role,
          powers: values.powers ? [values.powers] : [],
          clearance_level: values.clearanceLevel || 1,
          team_affiliations: [],
          status: 'ACTIVE',
          metadata: {}
        })
        .select()
        .single()

      if (profileError) {
        console.error('Profile creation error:', profileError)
        throw new Error(`Failed to create profile: ${profileError.message}`)
      }

      if (!profileData) {
        throw new Error('Profile was not created')
      }

      // Show success and redirect
      setShowSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (err) {
      console.error('Registration error:', err)
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = (e: React.MouseEvent) => {
    e.preventDefault()
    
    switch (currentStep) {
      case 'CREDENTIALS':
        form.trigger(['codename', 'email', 'password', 'confirmPassword'])
        if (form.formState.errors.codename || form.formState.errors.email || 
            form.formState.errors.password || form.formState.errors.confirmPassword) {
          return
        }
        setCurrentStep('ROLE')
        break
      case 'ROLE':
        form.trigger('role')
        if (form.formState.errors.role) {
          return
        }
        setCurrentStep('PROFILE')
        break
    }
  }

  const prevStep = (e: React.MouseEvent) => {
    e.preventDefault()
    
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
        <form noValidate className="space-y-6">
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
                      <Input placeholder="Your secret identity" {...field} />
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
                    <FormLabel>Initial Clearance Level</FormLabel>
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

          <div className="flex justify-between gap-4">
            {currentStep !== 'CREDENTIALS' && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="w-full font-comic"
              >
                Back
              </Button>
            )}
            {currentStep === 'PROFILE' ? (
              <Button
                type="button"
                className="w-full font-comic"
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={nextStep}
                className="w-full font-comic"
              >
                Next
              </Button>
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="p-2 text-sm text-red-500 bg-red-100 rounded"
            >
              {error}
            </div>
          )}

          {currentStep === 'CREDENTIALS' && (
            <div className="text-center mt-4">
              <Link
                href="/login"
                className="text-primary hover:underline font-comic-secondary"
              >
                Already have an account? Sign in
              </Link>
            </div>
          )}
        </form>
      </Form>
    </div>
  )
} 