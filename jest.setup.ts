import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    query: {},
  }),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  usePathname: () => '',
  useSearchParams: () => new URLSearchParams(),
}));

// Extend expect with custom matchers
expect.extend({
  toHaveHeroStatus(received: HTMLElement, status: string) {
    const hasClass = received.classList.contains(`status-${status.toLowerCase()}`);
    return {
      pass: hasClass,
      message: () =>
        `Expected element to${hasClass ? ' not' : ''} have hero status class "status-${status.toLowerCase()}"`,
    };
  },
  toHavePriorityLevel(received: HTMLElement, priority: string) {
    const hasClass = received.classList.contains(`priority-${priority.toLowerCase()}`);
    return {
      pass: hasClass,
      message: () =>
        `Expected element to${hasClass ? ' not' : ''} have priority class "priority-${priority.toLowerCase()}"`,
    };
  },
}); 