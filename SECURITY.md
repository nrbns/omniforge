# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Security Scanning

OmniForge uses automated security scanning to detect vulnerabilities:

### Snyk Security Scanning
- **Schedule**: Weekly (Mondays) and on every push/PR
- **Scope**: All dependencies across monorepo
- **Severity Threshold**: High and above
- **Action**: Results uploaded to GitHub Security tab

### OWASP ZAP WebSocket Security
- **Target**: WebSocket endpoints (`/realtime`)
- **Scope**: Authentication, authorization, injection attacks
- **Action**: Baseline scan on every PR

### API Key Leak Detection
- **Tool**: TruffleHog + custom grep patterns
- **Scope**: All code files (TS, TSX, JS, JSX)
- **Patterns Detected**:
  - `api_key`, `api-key`, `secret_key`, `private_key`
  - Excludes: `process.env`, `config.get`, `.env` files
- **Action**: Fails CI if leaks detected

## Reporting a Vulnerability

If you discover a security vulnerability, please:

1. **Do NOT** open a public issue
2. Email security@omniforge.dev (or create a private security advisory on GitHub)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours and work with you to resolve the issue.

## Security Best Practices

### For Developers

1. **Never commit API keys or secrets**
   - Use environment variables
   - Use `.env` files (gitignored)
   - Use secret management services in production

2. **Keep dependencies updated**
   - Run `npm audit` regularly
   - Review Snyk reports
   - Update vulnerable packages promptly

3. **Validate all inputs**
   - Use NestJS validation pipes
   - Sanitize user inputs
   - Use parameterized queries (Prisma)

4. **Secure WebSocket connections**
   - Authenticate users before joining rooms
   - Validate Yjs updates
   - Rate limit connections

### For Deployment

1. **Use HTTPS in production**
2. **Set secure CORS policies**
3. **Enable rate limiting**
4. **Use environment-specific secrets**
5. **Regular security audits**

## Known Vulnerabilities

None at this time. Check GitHub Security tab for latest status.

## Security Updates

Security patches are released as needed. Subscribe to GitHub releases to be notified.

