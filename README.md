# CAPE (Centralized Assignment & Priority Equipment)

<div align="center">
  <img src="docs/assets/logo.png" alt="CAPE Logo" width="200"/>
  <h3>🦸‍♂️ Superhero Support System 🦸‍♀️</h3>
</div>

## Overview

CAPE is a next-generation CRM system designed specifically for superhero organizations. Built with a comic book-inspired interface, it serves as a central hub for managing global operations, support requests, and mission coordination.

### Key Features

- 🎯 **Mission Support System**
  - Real-time incident tracking
  - Threat level assessment
  - Resource allocation
  - Civilian safety protocols

- 🛠️ **Equipment Management**
  - Maintenance scheduling
  - Upgrade tracking
  - Damage reporting
  - Inventory control

- 🔍 **Intelligence Hub**
  - Villain activity monitoring
  - Global threat assessment
  - Pattern analysis
  - Civilian impact reporting

- 🤖 **AI-Powered Features**
  - Automated triage
  - Predictive analytics
  - Smart resource allocation
  - Multilingual support

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- OpenAI API key (for AI features)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/cape.git
   cd cape
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Update environment variables with your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   OPENAI_API_KEY=your_openai_key
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Development Commands

- `npm run dev`: Start development server
- `npm run build`: Build production bundle
- `npm run start`: Start production server
- `npm run test`: Run test suite
- `npm run test:e2e`: Run E2E tests
- `npm run lint`: Run linter
- `npm run format`: Format code

## Architecture

### Tech Stack

- **Frontend**
  - Next.js 14 (App Router)
  - TypeScript
  - Tailwind CSS
  - shadcn/ui
  - Framer Motion

- **Backend**
  - Supabase
  - Edge Functions
  - PostgreSQL
  - Row Level Security

- **AI/ML**
  - OpenAI API
  - LangChain
  - Vector Store

### Project Structure

```
src/
├── app/           # Next.js app router pages
├── components/    # React components
│   ├── ui/       # Base UI components
│   └── features/ # Feature-specific components
├── lib/          # Utilities and helpers
├── styles/       # Global styles
└── types/        # TypeScript types

docs/             # Documentation
├── api/          # API documentation
├── guides/       # User guides
└── setup/        # Setup instructions

public/           # Static assets
├── icons/        # SVG icons
└── images/       # Images

tests/            # Test files
├── e2e/         # E2E tests
└── unit/        # Unit tests
```

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Commit Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:`: New features
- `fix:`: Bug fixes
- `docs:`: Documentation changes
- `style:`: Code style changes
- `refactor:`: Code refactoring
- `test:`: Test changes
- `chore:`: Build process or auxiliary tool changes

## Testing

### Unit Tests

```bash
npm run test
```

### E2E Tests

```bash
npm run test:e2e
```

### Visual Regression Tests

```bash
npm run test:visual
```

## Deployment

The application is deployed using AWS Amplify. Each push to the main branch triggers an automatic deployment.

### Environment Setup

1. Production: Triggered by pushes to `main`
2. Staging: Triggered by pushes to `develop`
3. Preview: Created for each PR

## License


## Acknowledgments

- Inspired by the world's greatest superheroes
- Built with love by the CAPE team
- Special thanks to all contributors 