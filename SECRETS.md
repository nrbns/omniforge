# 🔐 Secrets Management Guide

This guide explains how to securely manage API keys and secrets in OmniForge.

## ⚠️ **NEVER Commit Secrets**

- ❌ Never commit `.env` files
- ❌ Never commit API keys in code
- ❌ Never commit access tokens
- ✅ Always use `.env.example` as a template
- ✅ Always use environment variables

## 🔑 **Required Secrets**

### **For Development (Demo Mode)**
No API keys required! Run with `DEMO_MODE=true` to use mock responses.

### **For Production**

#### **AI/ML Providers**
- `HUGGINGFACE_API_KEY` - Get from [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
- `OPENAI_API_KEY` - Get from [platform.openai.com/api-keys](https://platform.openai.com/api-keys) (optional)
- `ANTHROPIC_API_KEY` - Get from [console.anthropic.com](https://console.anthropic.com) (optional)

#### **Database**
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_PASSWORD` - Redis password (if using)
- `NEO4J_PASSWORD` - Neo4j password

#### **Authentication**
- `CLERK_SECRET_KEY` - Clerk authentication secret
- `CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `JWT_SECRET` - JWT signing secret (min 32 chars)

#### **Design Tools**
- `FIGMA_API_KEY` - Figma personal access token

#### **Monitoring**
- `SENTRY_DSN` - Sentry DSN for error tracking (optional)

## 📝 **Environment Setup**

### **Local Development**

1. Copy example file:
```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env.local
```

2. Fill in your values:
```bash
# Edit apps/backend/.env and add your API keys
nano apps/backend/.env
```

3. For demo mode (no API keys needed):
```bash
# Just set DEMO_MODE=true
echo "DEMO_MODE=true" >> apps/backend/.env
```

### **GitHub Actions**

Use GitHub Secrets:

1. Go to repository Settings → Secrets and variables → Actions
2. Add secrets:
   - `HUGGINGFACE_API_KEY`
   - `OPENAI_API_KEY` (optional)
   - `DATABASE_URL` (for tests)
   - etc.

3. Use in workflows:
```yaml
env:
  HUGGINGFACE_API_KEY: ${{ secrets.HUGGINGFACE_API_KEY }}
```

### **Docker / Production**

Use Docker secrets or environment variables:

```bash
docker run -e HUGGINGFACE_API_KEY=your_key ...
```

Or use Docker secrets:
```bash
echo "your_key" | docker secret create huggingface_api_key -
```

### **Cloud Platforms**

#### **Vercel**
- Add secrets in Project Settings → Environment Variables
- Access via `process.env.HUGGINGFACE_API_KEY`

#### **AWS**
- Use AWS Secrets Manager or Parameter Store
- Use IAM roles for database access

#### **Heroku**
```bash
heroku config:set HUGGINGFACE_API_KEY=your_key
```

#### **Railway**
- Add via Railway dashboard
- Access via environment variables

## 🛡️ **Security Best Practices**

1. **Rotate Keys Regularly**: Update API keys every 90 days
2. **Use Least Privilege**: Only grant necessary permissions
3. **Monitor Usage**: Check API usage dashboards regularly
4. **Separate Environments**: Use different keys for dev/staging/prod
5. **Audit Logs**: Monitor access to secrets

## 🔍 **Checking for Leaked Secrets**

Before committing:

```bash
# Install git-secrets
brew install git-secrets

# Add patterns
git secrets --register-aws

# Scan
git secrets --scan
```

Or use tools:
- [truffleHog](https://github.com/trufflesecurity/trufflehog)
- [gitleaks](https://github.com/gitleaks/gitleaks)

## 📚 **Resources**

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [12 Factor App Config](https://12factor.net/config)

---

**Remember**: Secrets are like passwords - never share them, never commit them, always rotate them!

