import { test, expect } from '@playwright/test';
import { TEST_HERO_PASSWORD } from '../utils/test-constants';

test.describe('Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('shows validation errors for empty fields', async ({ page }) => {
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByText('Codename must be at least 3 characters')).toBeVisible();
  });

  test('validates password requirements', async ({ page }) => {
    await page.getByPlaceholder('Enter your hero codename').fill('TestHero');
    await page.getByPlaceholder('Enter your email').fill('test@heroes.cape');
    await page.getByPlaceholder('Create a password').fill('weak');
    await page.getByPlaceholder('Confirm your password').fill('weak');
    await page.getByRole('button', { name: 'Next' }).click();

    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible();
    await expect(page.getByText('Password must contain at least one uppercase letter')).toBeVisible();
    await expect(page.getByText('Password must contain at least one number')).toBeVisible();
    await expect(page.getByText('Password must contain at least one special character')).toBeVisible();
  });

  test('validates password confirmation', async ({ page }) => {
    await page.getByPlaceholder('Enter your hero codename').fill('TestHero');
    await page.getByPlaceholder('Enter your email').fill('test@heroes.cape');
    await page.getByPlaceholder('Create a password').fill(TEST_HERO_PASSWORD);
    await page.getByPlaceholder('Confirm your password').fill('different');
    await page.getByRole('button', { name: 'Next' }).click();

    await expect(page.getByText('Passwords don\'t match')).toBeVisible();
  });

  test('completes registration flow successfully', async ({ page }) => {
    // Step 1: Credentials
    await page.getByPlaceholder('Enter your hero codename').fill('NewTestHero');
    await page.getByPlaceholder('Enter your email').fill('newtest@heroes.cape');
    await page.getByPlaceholder('Create a password').fill(TEST_HERO_PASSWORD);
    await page.getByPlaceholder('Confirm your password').fill(TEST_HERO_PASSWORD);
    await page.getByRole('button', { name: 'Next' }).click();

    // Step 2: Role Selection
    await expect(page.getByText('Step 2 of 3')).toBeVisible();
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Hero' }).click();
    await page.getByRole('button', { name: 'Next' }).click();

    // Step 3: Profile
    await expect(page.getByText('Step 3 of 3')).toBeVisible();
    await page.getByPlaceholder('Enter your real name').fill('John Doe');
    await page.getByPlaceholder('List your superpowers').fill('Flying, Super Strength');
    await page.getByRole('spinbutton').fill('5');
    await page.getByRole('button', { name: 'Create Account' }).click();

    // Check for success and redirect
    await expect(page.getByTestId('success-effect')).toBeVisible();
    await expect(page).toHaveURL('/login');
  });

  test('allows navigation between steps', async ({ page }) => {
    // Fill credentials
    await page.getByPlaceholder('Enter your hero codename').fill('TestHero');
    await page.getByPlaceholder('Enter your email').fill('test@heroes.cape');
    await page.getByPlaceholder('Create a password').fill(TEST_HERO_PASSWORD);
    await page.getByPlaceholder('Confirm your password').fill(TEST_HERO_PASSWORD);
    await page.getByRole('button', { name: 'Next' }).click();

    // Check we're on role step
    await expect(page.getByText('Step 2 of 3')).toBeVisible();

    // Go back to credentials
    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page.getByText('Step 1 of 3')).toBeVisible();
  });
}); 