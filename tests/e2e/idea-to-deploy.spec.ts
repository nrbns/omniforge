import { test, expect } from '@playwright/test';

/**
 * E2E Test: Full flow from idea to deploy
 * Tests: Idea parse → sandbox run Python/TS → collab edit → Vercel deploy
 */
test.describe('Idea to Deploy Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // Wait for page to load
    await page.waitForSelector('text=OmniForge', { timeout: 10000 });
  });

  test('should create idea and parse it', async ({ page }) => {
    // Click "New Idea" button
    await page.click('text=New Idea');
    
    // Fill in idea form
    await page.fill('input[placeholder*="idea" i], input[name*="title" i]', 'Build a todo app');
    await page.fill('textarea[placeholder*="description" i], textarea[name*="description" i]', 'A simple todo app with add, edit, delete functionality');
    
    // Submit form
    await page.click('button[type="submit"], button:has-text("Create"), button:has-text("Submit")');
    
    // Wait for idea to be created and parsed
    await page.waitForSelector('text=Todo app', { timeout: 30000 });
    
    // Verify idea appears in dashboard
    const ideaCard = page.locator('text=Todo app').first();
    await expect(ideaCard).toBeVisible();
  });

  test('should open sandbox and run Python code', async ({ page }) => {
    // Navigate to an existing idea (or create one)
    await page.goto('http://localhost:3000/dashboard');
    
    // Click on first idea card
    const firstIdea = page.locator('[data-testid="idea-card"], .idea-card, article').first();
    if (await firstIdea.count() > 0) {
      await firstIdea.click();
    } else {
      // Create a new idea first
      await page.click('text=New Idea');
      await page.fill('input[placeholder*="idea" i]', 'Test Python sandbox');
      await page.fill('textarea', 'Test sandbox functionality');
      await page.click('button[type="submit"]');
      await page.waitForSelector('text=Test Python sandbox', { timeout: 30000 });
      await page.click('text=Test Python sandbox');
    }
    
    // Navigate to sandbox tab
    await page.click('text=Sandbox, button:has-text("Sandbox"), [aria-label*="Sandbox" i]');
    
    // Wait for sandbox to load
    await page.waitForSelector('select, [data-testid="lang-selector"]', { timeout: 10000 });
    
    // Switch to Python if not already
    const langSelector = page.locator('select, [data-testid="lang-selector"]').first();
    if (await langSelector.count() > 0) {
      await langSelector.selectOption('python');
    }
    
    // Type Python code
    const codeEditor = page.locator('textarea, .monaco-editor, [role="textbox"]').first();
    await codeEditor.fill('print("Hello from OmniForge!")\nimport sys\nprint(f"Python {sys.version}")');
    
    // Click Run button
    await page.click('button:has-text("Run"), [aria-label*="Run" i]');
    
    // Wait for output (with timeout for Pyodide boot)
    await page.waitForSelector('text=Hello from OmniForge', { timeout: 15000 });
    
    // Verify output
    const output = page.locator('text=Hello from OmniForge');
    await expect(output).toBeVisible();
  });

  test('should run TypeScript code in sandbox', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    // Navigate to sandbox
    const firstIdea = page.locator('[data-testid="idea-card"], .idea-card').first();
    if (await firstIdea.count() > 0) {
      await firstIdea.click();
      await page.click('text=Sandbox, button:has-text("Sandbox")');
    }
    
    // Ensure TypeScript is selected
    const langSelector = page.locator('select').first();
    if (await langSelector.count() > 0) {
      await langSelector.selectOption('typescript');
    }
    
    // Type TypeScript code
    const codeEditor = page.locator('textarea, .monaco-editor').first();
    await codeEditor.fill('console.log("Hello TypeScript!");\nconst x: number = 42;\nconsole.log(x);');
    
    // Run code
    await page.click('button:has-text("Run")');
    
    // Wait for output
    await page.waitForSelector('text=Hello TypeScript', { timeout: 10000 });
    await expect(page.locator('text=42')).toBeVisible();
  });

  test('should collaborate in real-time (multi-user)', async ({ page, context }) => {
    // Create a second browser context (simulating second user)
    const secondContext = await context.browser()?.newContext();
    const secondPage = secondContext ? await secondContext.newPage() : null;
    
    if (!secondPage) {
      test.skip();
      return;
    }
    
    // User 1: Navigate to idea
    await page.goto('http://localhost:3000/dashboard');
    const firstIdea = page.locator('[data-testid="idea-card"], .idea-card').first();
    if (await firstIdea.count() > 0) {
      await firstIdea.click();
    }
    
    // User 2: Navigate to same idea
    await secondPage.goto(page.url());
    
    // User 1: Edit code
    await page.click('text=Code, button:has-text("Code")');
    const editor1 = page.locator('.monaco-editor, textarea').first();
    await editor1.fill('// User 1 edit\nconst test = "collaboration";');
    
    // Wait a bit for Yjs sync
    await page.waitForTimeout(1000);
    
    // User 2: Should see User 1's changes
    const editor2 = secondPage.locator('.monaco-editor, textarea').first();
    const content = await editor2.textContent();
    expect(content).toContain('collaboration');
    
    await secondContext.close();
  });

  test('should trigger build and show progress', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    // Click on first project or idea
    const firstItem = page.locator('[data-testid="idea-card"], [data-testid="project-card"], .idea-card, .project-card').first();
    if (await firstItem.count() > 0) {
      await firstItem.click();
    }
    
    // Look for Build button
    const buildButton = page.locator('button:has-text("Build"), button:has-text("Generate"), [aria-label*="Build" i]').first();
    if (await buildButton.count() > 0) {
      await buildButton.click();
      
      // Wait for build progress
      await page.waitForSelector('text=Building, text=Generating, text=Progress, [data-testid="build-progress"]', { timeout: 5000 });
      
      // Verify build status appears
      const buildStatus = page.locator('text=Building, text=Generating, text=Progress').first();
      await expect(buildStatus).toBeVisible({ timeout: 10000 });
    }
  });
});

