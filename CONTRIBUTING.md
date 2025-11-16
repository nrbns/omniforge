# Contributing to OmniForge

Thank you for your interest in contributing to OmniForge! 🚀

OmniForge is the world's first open-source, end-to-end **Idea → App → Deployment → App Store** AI Builder. We're building a community-driven platform that makes app development accessible to everyone.

---

## 🎯 How to Contribute

### Reporting Bugs

1. **Check existing issues**: Search [GitHub Issues](https://github.com/nrbns/omniforge/issues) to see if the bug is already reported.
2. **Create a new issue**: Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md) with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment (OS, Node version, etc.)

### Suggesting Features

1. **Check existing issues**: Search for similar feature requests.
2. **Create a feature request**: Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md) with:
   - Clear description
   - Use case / problem it solves
   - Proposed solution (if any)

### Contributing Code

1. **Fork the repository**
2. **Create a branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes**: Follow our coding standards (see below)
4. **Test your changes**: Run `npm test` and `npm run build`
5. **Commit**: Use conventional commits (see below)
6. **Push**: `git push origin feature/your-feature-name`
7. **Open a Pull Request**: Use the [PR template](.github/pull_request_template.md)

---

## 📋 Development Setup

### Prerequisites

- Node.js 18+ and npm
- Docker (for PostgreSQL, Redis, Neo4j, Qdrant)
- Git

### Quick Start

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/omniforge.git
cd omniforge

# Install dependencies
npm install

# Start Docker services
docker-compose up -d

# Run database migrations
npm run db:migrate

# Start development servers
npm run dev
```

**Access**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- API Docs: http://localhost:3001/api/docs

### Demo Mode (No API Keys)

```bash
npm run demo:setup
```

This sets up everything automatically with demo data.

---

## 🏗️ Project Structure

```
omniforge/
├── apps/
│   ├── backend/          # NestJS API server
│   │   ├── src/
│   │   │   ├── ideas/     # Idea management
│   │   │   ├── projects/  # Project management
│   │   │   ├── agents/    # Agent orchestration
│   │   │   └── realtime/  # WebSocket gateway
│   │   └── prisma/        # Database schema
│   └── frontend/          # Next.js frontend
│       └── src/app/       # Next.js App Router
├── packages/
│   ├── agents/            # Multi-agent build engine
│   ├── redix/             # Redix Idea Layer
│   ├── ui/                # Shared UI components
│   └── shared/            # Shared types
└── design-tokens/          # Design token definitions
```

---

## 📝 Coding Standards

### TypeScript

- **Strict mode**: Always use TypeScript strict mode
- **Types**: Prefer explicit types over `any`
- **Interfaces**: Use interfaces for object shapes
- **Naming**: Use PascalCase for components, camelCase for functions

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
}

function getUserById(id: string): Promise<User> {
  // ...
}

// ❌ Bad
function getUser(id: any): any {
  // ...
}
```

### React/Next.js

- **Components**: Use functional components with hooks
- **Props**: Define prop types with TypeScript interfaces
- **State**: Prefer `useState` and `useReducer` over class components
- **Performance**: Use `React.memo` for expensive components

```tsx
// ✅ Good
interface ButtonProps {
  label: string;
  onClick: () => void;
}

export const Button = React.memo(({ label, onClick }: ButtonProps) => {
  return <button onClick={onClick}>{label}</button>;
});
```

### NestJS

- **Modules**: One module per feature
- **Services**: Business logic in services, not controllers
- **DTOs**: Use DTOs for request/response validation
- **Error Handling**: Use NestJS exception filters

```typescript
// ✅ Good
@Injectable()
export class IdeasService {
  async create(dto: CreateIdeaDto): Promise<Idea> {
    // Business logic here
  }
}
```

### Git Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: Add onboarding tour
fix: Resolve Yjs sync issue
docs: Update README with demo mode
refactor: Simplify agent orchestration
test: Add unit tests for IdeasService
chore: Update dependencies
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance

---

## 🧪 Testing

### Running Tests

```bash
# All tests
npm test

# Backend only
cd apps/backend && npm test

# Frontend only
cd apps/frontend && npm test

# E2E tests (Playwright)
npm run test:e2e
```

### Writing Tests

- **Unit tests**: Test individual functions/components
- **Integration tests**: Test API endpoints
- **E2E tests**: Test user flows (Playwright)

```typescript
// Example unit test
describe('IdeasService', () => {
  it('should create an idea', async () => {
    const idea = await ideasService.create({
      userId: 'test-user',
      title: 'Test Idea',
      rawInput: 'Build a todo app',
    });
    expect(idea.title).toBe('Test Idea');
  });
});
```

---

## 🎨 UI/UX Guidelines

### Design Tokens

Use design tokens from `design-tokens/tokens.json`:

```tsx
// ✅ Good
<button className="bg-primary-600 text-white rounded-lg">
  Click me
</button>

// ❌ Bad
<button style={{ backgroundColor: '#7c3aed', color: 'white' }}>
  Click me
</button>
```

### Accessibility

- **ARIA labels**: Add `aria-label` to interactive elements
- **Keyboard navigation**: Ensure all features work with keyboard
- **Screen readers**: Test with screen reader software
- **Color contrast**: Follow WCAG AA standards

```tsx
// ✅ Good
<button aria-label="Create new idea" onClick={handleClick}>
  New Idea
</button>
```

---

## 📚 Documentation

### Code Comments

- **Public APIs**: Document all public functions/classes
- **Complex logic**: Explain why, not what
- **JSDoc**: Use JSDoc for TypeScript functions

```typescript
/**
 * Streams AI-generated improvements to idea description in real-time.
 * Uses RealtimeGateway to inject text directly into Yjs document.
 *
 * @param ideaId - The ID of the idea to improve
 * @param prompt - Optional custom prompt for AI
 * @returns Promise with success status and chunk count
 */
async streamAIImprovements(ideaId: string, prompt?: string) {
  // ...
}
```

### README Updates

- Update README.md when adding features
- Include examples and screenshots
- Keep installation instructions current

---

## 🐛 Debugging

### Backend

```bash
# Enable debug logs
DEBUG=* npm run dev

# Check Prisma migrations
cd apps/backend && npx prisma migrate status

# View database
npx prisma studio
```

### Frontend

```bash
# Enable React DevTools
# Install browser extension

# Check build errors
npm run build

# Lint errors
npm run lint
```

---

## 🚀 Release Process

1. **Update version**: `npm version patch|minor|major`
2. **Update CHANGELOG.md**: Document changes
3. **Create GitHub release**: Tag and release notes
4. **Deploy**: Automatic via CI/CD (GitHub Actions)

---

## 💬 Community

- **Discord**: [Join our Discord](https://discord.gg/omniforge) (coming soon)
- **Twitter/X**: [@omniforge](https://twitter.com/omniforge) (coming soon)
- **GitHub Discussions**: Use for Q&A and ideas

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## 🙏 Thank You!

Every contribution, no matter how small, helps make OmniForge better. Thank you for being part of our community! 🎉

---

**Questions?** Open an issue or reach out to maintainers.
