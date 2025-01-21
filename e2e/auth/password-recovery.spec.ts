import { test, expect } from '@playwright/test'
import { TEST_HERO_PASSWORD } from '../utils/test-constants'

test.describe('Password Recovery Flow', () => {
  test.describe('Forgot Password', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/forgot-password')
    })

    test('shows validation error for invalid email', async ({ page }) => {
      await page.getByPlaceholder('Enter your email address').fill('invalid-email')
      await page.getByRole('button', { name: 'Send Reset Instructions' }).click()
      await expect(page.getByText('Please enter a valid email address')).toBeVisible()
    })

    test('shows success message after submitting valid email', async ({ page }) => {
      await page.getByPlaceholder('Enter your email address').fill('test@heroes.cape')
      await page.getByRole('button', { name: 'Send Reset Instructions' }).click()
      await expect(page.getByTestId('success-effect')).toBeVisible()
      await expect(page.getByText('Password reset instructions have been sent')).toBeVisible()
    })

    test('navigates back to login', async ({ page }) => {
      await page.getByRole('button', { name: 'Back to Login' }).click()
      await expect(page).toHaveURL('/login')
    })
  })

  test.describe('Reset Password', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/reset-password')
    })

    test('validates password requirements', async ({ page }) => {
      await page.getByPlaceholder('Enter your new password').fill('weak')
      await page.getByPlaceholder('Confirm your new password').fill('weak')
      await page.getByRole('button', { name: 'Reset Password' }).click()

      await expect(page.getByText('Password must be at least 8 characters')).toBeVisible()
      await expect(page.getByText('Password must contain at least one uppercase letter')).toBeVisible()
      await expect(page.getByText('Password must contain at least one number')).toBeVisible()
      await expect(page.getByText('Password must contain at least one special character')).toBeVisible()
    })

    test('validates password confirmation', async ({ page }) => {
      await page.getByPlaceholder('Enter your new password').fill(TEST_HERO_PASSWORD)
      await page.getByPlaceholder('Confirm your new password').fill('different')
      await page.getByRole('button', { name: 'Reset Password' }).click()

      await expect(page.getByText('Passwords don\'t match')).toBeVisible()
    })

    test('shows success message after resetting password', async ({ page }) => {
      await page.getByPlaceholder('Enter your new password').fill(TEST_HERO_PASSWORD)
      await page.getByPlaceholder('Confirm your new password').fill(TEST_HERO_PASSWORD)
      await page.getByRole('button', { name: 'Reset Password' }).click()

      await expect(page.getByTestId('success-effect')).toBeVisible()
      await expect(page.getByText('Password has been successfully reset')).toBeVisible()
      await expect(page).toHaveURL('/login')
    })
  })
}) 