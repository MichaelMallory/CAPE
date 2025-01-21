import path from 'path';

// Storage state for authenticated user sessions
export const STORAGE_STATE = path.join(process.cwd(), 'e2e/.auth/user.json');

// Test user credentials - these should be overridden by environment variables in CI
export const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'test@hero-hq.com',
  password: process.env.TEST_USER_PASSWORD || 'test-password',
};

// Common test selectors
export const SELECTORS = {
  LOGIN: {
    emailInput: '[data-test-id="email"]',
    passwordInput: '[data-test-id="password"]',
    loginButton: '[data-test-id="login-button"]',
  },
  NAVIGATION: {
    dashboard: '[data-test-id="nav-dashboard"]',
    tickets: '[data-test-id="nav-tickets"]',
    equipment: '[data-test-id="nav-equipment"]',
    intelligence: '[data-test-id="nav-intelligence"]',
  },
};

export const TEST_HERO_CODENAME = 'TestHero';
export const TEST_HERO_PASSWORD = 'password123!';

export const TEST_USERS = {
  STANDARD: {
    codename: TEST_HERO_CODENAME,
    password: TEST_HERO_PASSWORD,
  },
  MFA: {
    codename: 'MFAHero',
    password: TEST_HERO_PASSWORD,
    verificationCode: '123456',
  },
} as const; 