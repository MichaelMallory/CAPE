import path from 'path';

// Storage state for authenticated user sessions
export const STORAGE_STATE = path.join(process.cwd(), 'e2e/.auth/user.json');

// Test user credentials - these should match the seeded test accounts
export const TEST_USERS = {
  STANDARD: {
    email: process.env.TEST_HERO_EMAIL || 'test_hero@cape.dev',
    password: process.env.TEST_HERO_PASSWORD || 'test_hero123',
  },
  SUPPORT: {
    email: process.env.TEST_SUPPORT_EMAIL || 'test_support@cape.dev',
    password: process.env.TEST_SUPPORT_PASSWORD || 'test_support123',
  },
  MFA: {
    email: 'test_hero@cape.dev', // Using hero account for MFA tests
    password: process.env.TEST_HERO_PASSWORD || 'test_hero123',
    verificationCode: '123456', // This should be configured in the MFA setup
  },
} as const;

// Common test selectors
export const SELECTORS = {
  LOGIN: {
    emailInput: '[data-testid="email"]',
    passwordInput: '[data-testid="password"]',
    loginButton: '[data-testid="login-button"]',
    rememberMe: '[data-testid="remember-me"]',
    forgotPassword: '[data-testid="forgot-password"]',
  },
  NAVIGATION: {
    dashboard: '[data-testid="nav-dashboard"]',
    tickets: '[data-testid="nav-tickets"]',
    equipment: '[data-testid="nav-equipment"]',
    intelligence: '[data-testid="nav-intelligence"]',
  },
}; 