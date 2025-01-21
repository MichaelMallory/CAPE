module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'heroes',      // Hero-related changes
        'missions',    // Mission management
        'equipment',   // Equipment and inventory
        'tickets',     // Ticket system
        'auth',        // Authentication and authorization
        'ui',          // UI components and styling
        'api',         // API and backend services
        'db',          // Database changes
        'tests',       // Testing infrastructure
        'docs',        // Documentation
        'ci',          // CI/CD pipeline
        'deps',        // Dependencies
        'config',      // Configuration changes
      ],
    ],
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation
        'style',    // Code style changes
        'refactor', // Code refactoring
        'perf',     // Performance improvements
        'test',     // Adding or updating tests
        'build',    // Build system changes
        'ci',       // CI configuration
        'chore',    // Maintenance
        'revert',   // Reverting changes
      ],
    ],
  },
}; 