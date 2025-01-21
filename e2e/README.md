# CAPE E2E Testing Guidelines

## Directory Structure
```
e2e/
├── auth/              # Authentication setup and helpers
├── fixtures/          # Test fixtures and page objects
├── utils/             # Test utilities and constants
├── .auth/             # Authentication state storage
└── specs/             # Test specifications by feature
```

## Test Organization
- Group tests by feature/functionality, not by component
- Use descriptive test names that explain the behavior being tested
- Follow the "Arrange-Act-Assert" pattern
- Keep tests focused and isolated

## Locator Strategy (in order of preference)
1. `getByRole` - Best for accessibility and resilience
2. `getByText`, `getByLabel`, `getByPlaceholder` - For semantic elements
3. `data-test-id` - Only when semantic selectors aren't suitable

## Authentication
- Use `auth.setup.ts` for login flows
- Store authentication state in `e2e/.auth/user.json`
- Use `test.use({ storageState: ... })` for authenticated tests

## Page Objects
- Define page interactions in `fixtures/`
- Keep selectors in `utils/test-constants.ts`
- Use meaningful method names that describe user actions

## Example Test Pattern
```typescript
test.describe('Mission Support Tickets', () => {
  test.use({ storageState: 'e2e/.auth/user.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('should create high-priority mission ticket', async ({ dashboardPage }) => {
    // Arrange
    const missionData = {
      title: 'Investigate Energy Anomaly',
      description: 'Unknown energy signature detected',
      priority: 'ALPHA'
    };

    // Act
    await dashboardPage.createTicket(
      missionData.title,
      missionData.description,
      missionData.priority
    );

    // Assert
    await dashboardPage.verifyTicketCreated(missionData.title);
  });
});
```

## Best Practices
- Test user-visible behavior, not implementation details
- Use meaningful test data that reflects real scenarios
- Handle asynchronous operations properly with `await`
- Add comments for complex test scenarios
- Use test fixtures for common setup/teardown

## Cross-browser Testing
- Tests run on:
  - Desktop: Chrome, Firefox, Safari
  - Mobile: iOS Safari, Android Chrome
- Use responsive design testing utilities
- Test critical paths across all browsers

## Debugging
- Use `test.only()` for focused testing
- Enable trace viewer with `--trace on`
- Check video recordings for failed tests
- Use HTML reporter for detailed test results

## Performance
- Enable parallel test execution where possible
- Use `test.slow()` for inherently slow tests
- Implement retry logic for potentially flaky tests
- Keep setup/teardown efficient

## Environment Variables
Required environment variables for testing:
```bash
TEST_USER_EMAIL=test@hero-hq.com
TEST_USER_PASSWORD=test-password
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Running Tests
```bash
# Run all tests
npm run test:e2e

# Run specific test file
npm run test:e2e tests/dashboard.spec.ts

# Run tests with UI mode
npm run test:e2e -- --ui

# Debug tests
npm run test:e2e -- --debug
``` 