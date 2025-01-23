export const TEST_USERS = {
  STANDARD: {
    email: 'test@example.com',
    password: 'TestPass123!',
    name: 'Test User'
  },
  SUPPORT_STAFF: {
    email: 'support@hero-hq.com',
    password: 'SupportPass123!',
    name: 'Support Staff'
  },
  INVALID: {
    email: 'wrong@example.com',
    password: 'WrongPass123!'
  }
} as const; 