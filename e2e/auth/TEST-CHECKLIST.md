# Authentication Tests Checklist

## Basic Login Flow (`login.spec.ts`)
- [ ] Form Validation
  - [ ] Shows validation errors for empty fields
  - [ ] Shows validation error for invalid email format
  - [ ] Shows error for invalid credentials
- [ ] Successful Login
  - [ ] Successfully logs in with valid credentials
  - [ ] Redirects to dashboard after successful login
  - [ ] Shows appropriate loading state during login
- [ ] Remember Me
  - [ ] Remembers login state when "Remember me" is checked
  - [ ] Session persists across browser tabs
  - [ ] Session persists after browser restart (when remember me is checked)

## Test Coverage Areas
- ✓ Input Validation
- ✓ Error Handling
- ✓ Success Flows
- ✓ Navigation
- ✓ Session Management
- ✓ Accessibility (using role-based selectors)

## Notes
- All tests use semantic locators (getByRole, getByLabel, getByText)
- Tests are isolated and reproducible
- Each test focuses on a single piece of functionality
- Proper async/await handling throughout
- Follows Playwright best practices 