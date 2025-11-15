# Contributing to OmniForge

Thank you for your interest in contributing to OmniForge! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Code Style Guide](#code-style-guide)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Agent Development](#agent-development)

---

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please read and follow our Code of Conduct.

---

## How Can I Contribute?

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/omniforge/omniforge/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node version, etc.)
   - Screenshots if applicable

### Suggesting Features

1. Check existing feature requests
2. Open an issue with:
   - Use case description
   - Proposed solution
   - Benefits to users
   - Mockups/wireframes if applicable

### Contributing Code

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Ensure all tests pass
6. Submit a pull request

---

## Development Setup

### Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose
- Git

### Initial Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/omniforge.git
cd omniforge

# Add upstream remote
git remote add upstream https://github.com/omniforge/omniforge.git

# Install dependencies
npm install

# Start infrastructure services
npm run docker:up

# Set up environment variables
cp apps/backend/.env.example apps/backend/.env
# Edit apps/backend/.env with your configuration

# Run database migrations
npm run db:migrate

# Start development servers
npm run dev
```

### Verify Setup

1. Frontend: `http://localhost:3000`
2. Backend API: `http://localhost:3001/api`
3. Database: `postgresql://localhost:5432/omniforge`

---

## Development Workflow

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test additions/updates

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples**:
```
feat(ideas): add idea branching support

fix(backend): resolve build status update race condition

docs(readme): update installation instructions
```

### Syncing with Upstream

```bash
# Fetch upstream changes
git fetch upstream

# Checkout main branch
git checkout main

# Merge upstream changes
git merge upstream/main

# Push to your fork
git push origin main
```

---

## Code Style Guide

### TypeScript

- Use TypeScript strict mode
- Prefer interfaces over types for public APIs
- Use explicit return types for functions
- Avoid `any` - use `unknown` or proper types

```typescript
// Good
interface User {
  id: string;
  email: string;
}

function getUser(id: string): Promise<User> {
  // ...
}

// Bad
function getUser(id: any): any {
  // ...
}
```

### NestJS Backend

- Follow NestJS conventions
- Use DTOs for all API endpoints
- Inject dependencies via constructor
- Use modules for feature organization

```typescript
// Good
@Injectable()
export class IdeasService {
  constructor(
    private prisma: PrismaService,
    private realtime: RealtimeService,
  ) {}

  async create(dto: CreateIdeaDto): Promise<Idea> {
    // ...
  }
}
```

### React/Next.js Frontend

- Use functional components with hooks
- Keep components small and focused
- Use TypeScript for props
- Prefer composition over inheritance

```typescript
// Good
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  onClick: () => void;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', onClick, children }) => {
  return <button className={variant} onClick={onClick}>{children}</button>;
};
```

### Naming Conventions

- **Files**: `kebab-case.ts` (e.g., `idea-parser.agent.ts`)
- **Classes**: `PascalCase` (e.g., `IdeaParserAgent`)
- **Functions/Variables**: `camelCase` (e.g., `parseIdea`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`)

---

## Testing Guidelines

### Unit Tests

- Write tests for all business logic
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Aim for >80% code coverage

```typescript
describe('IdeaParserAgent', () => {
  it('should parse idea with title and description', async () => {
    // Arrange
    const agent = new IdeaParserAgent();
    const idea = { title: 'Test App', description: 'A test app' };

    // Act
    const spec = await agent.parseIdea(idea);

    // Assert
    expect(spec.name).toBe('Test App');
    expect(spec.pages).toHaveLength(1);
  });
});
```

### Integration Tests

- Test API endpoints
- Test database operations
- Test agent workflows
- Use test database

### E2E Tests

- Test critical user flows
- Use Playwright for browser automation
- Keep tests maintainable

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run E2E tests
npm run test:e2e
```

---

## Pull Request Process

### Before Submitting

1. **Update documentation** if needed
2. **Add tests** for new features
3. **Ensure all tests pass**
4. **Check linting**: `npm run lint`
5. **Type check**: `npm run type-check`
6. **Build succeeds**: `npm run build`

### PR Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] No breaking changes (or documented)

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Documentation updated
```

### Review Process

1. Maintainers review within 48 hours
2. Address feedback promptly
3. Keep PR focused and small if possible
4. Squash commits before merge (unless requested otherwise)

---

## Agent Development

### Creating a New Agent

1. Create agent file in `packages/agents/src/`
2. Export from `packages/agents/src/index.ts`
3. Add to `AgentsService` in backend
4. Create queue in `agents.module.ts`
5. Write tests
6. Document usage

### Agent Template

```typescript
export class MyAgent {
  /**
   * Brief description of what the agent does
   */
  async process(input: InputType): Promise<OutputType> {
    // Implementation
  }

  private helperMethod(): void {
    // Private helper methods
  }
}
```

### Agent Best Practices

- Single Responsibility Principle
- Idempotent operations when possible
- Error handling and logging
- Progress reporting for long-running tasks
- Use job queue for async operations

---

## Documentation

### Code Comments

- Use JSDoc for public APIs
- Explain "why" not "what"
- Keep comments up to date

```typescript
/**
 * Parses raw idea input and extracts structured specification.
 * Uses LLM to identify pages, data models, and API requirements.
 *
 * @param idea - The idea to parse
 * @returns Parsed application specification
 */
async parseIdea(idea: Idea): Promise<AppSpec> {
  // ...
}
```

### README Updates

- Update README for new features
- Keep examples current
- Document breaking changes

---

## Getting Help

- **Discord**: [Join our Discord](https://discord.gg/omniforge)
- **GitHub Issues**: For bug reports and feature requests
- **Discussions**: For questions and ideas

---

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Thanked in release notes
- Given appropriate credit in code

Thank you for contributing to OmniForge! 🚀

