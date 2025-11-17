import { test, expect } from '@playwright/test';

/**
 * User Acceptance Testing (UAT)
 * Tests from end-user perspective - real-world scenarios
 */
test.describe('User Acceptance Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto('http://localhost:3000');
  });

  test('UAT-1: Complete Idea to Deployed App Flow', async ({ page }) => {
    // User creates an idea
    await page.click('text=New Idea');
    await page.fill('[placeholder*="idea"]', 'A fitness tracking app for runners');
    await page.click('button:has-text("Create")');

    // Wait for idea to be parsed
    await page.waitForSelector('text=PARSED', { timeout: 30000 });

    // User creates project from idea
    await page.click('button:has-text("Create Project")');
    await page.waitForSelector('text=BUILDING', { timeout: 10000 });

    // User views build timeline
    await expect(page.locator('text=Planner')).toBeVisible();
    await expect(page.locator('text=UI Designer')).toBeVisible();
    await expect(page.locator('text=Backend')).toBeVisible();

    // Wait for build to complete
    await page.waitForSelector('text=SUCCESS', { timeout: 60000 });

    // User views preview
    await page.click('text=Preview');
    const previewUrl = await page.locator('a[href*="preview"]').getAttribute('href');
    expect(previewUrl).toBeTruthy();

    // User deploys
    await page.click('button:has-text("Deploy")');
    await page.waitForSelector('text=DEPLOYED', { timeout: 30000 });

    // Verify deployed app is accessible
    const deployedUrl = await page.locator('a[href*="deploy"]').getAttribute('href');
    expect(deployedUrl).toBeTruthy();
  });

  test('UAT-2: Visual Editor - Edit Design and Content', async ({ page }) => {
    // Navigate to existing project
    await page.goto('http://localhost:3000/dashboard/projects');
    await page.click('.project-card:first-child');

    // Open visual editor
    await page.click('text=Editor');
    await page.waitForSelector('text=Design Tokens', { timeout: 5000 });

    // Edit design tokens
    await page.click('text=Design Tokens');
    await page.fill('input[value*="#7c3aed"]', '#ff0000'); // Change primary color
    await page.waitForTimeout(1000); // Wait for hot patch

    // Edit content
    await page.click('text=Content');
    await page.fill('input[placeholder*="headline"]', 'New Amazing Headline');
    await page.waitForTimeout(1000);

    // Verify changes applied
    await page.click('text=Preview');
    await expect(page.locator('text=New Amazing Headline')).toBeVisible();

    // Commit changes
    await page.click('text=Publish Changes');
    await expect(page.locator('text=Changes committed')).toBeVisible();
  });

  test('UAT-3: CRM Lead Capture and Workflow', async ({ page }) => {
    // Navigate to CRM
    await page.goto('http://localhost:3000/dashboard/crm');

    // Create a lead manually
    await page.click('button:has-text("Add Lead")');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="name"]', 'Test User');
    await page.click('button:has-text("Save")');

    // Verify lead appears in table
    await expect(page.locator('text=test@example.com')).toBeVisible();

    // Check lead scoring
    await page.click('text=test@example.com');
    await expect(page.locator('text=Lead Score')).toBeVisible();

    // Verify workflow triggered (welcome email)
    await page.goto('http://localhost:3000/dashboard/workflows');
    await expect(page.locator('text=Welcome Email')).toBeVisible();
  });

  test('UAT-4: Marketing Campaign Creation and A/B Testing', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/marketing');

    // Create email campaign
    await page.click('button:has-text("New Campaign")');
    await page.fill('input[name="name"]', 'Welcome Series');
    await page.selectOption('select[name="type"]', 'email');
    await page.click('button:has-text("Create")');

    // Create A/B test
    await page.click('button:has-text("Create A/B Test")');
    await page.fill('input[name="testName"]', 'Subject Line Test');
    await page.click('button:has-text("Add Variant")');
    await page.fill('input[name="variant1"]', 'Welcome!');
    await page.fill('input[name="variant2"]', 'Get Started Today!');
    await page.click('button:has-text("Start Test")');

    // Verify test is running
    await expect(page.locator('text=Subject Line Test')).toBeVisible();
    await expect(page.locator('text=RUNNING')).toBeVisible();
  });

  test('UAT-5: E-Commerce Store Creation', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/projects');
    await page.click('button:has-text("New Project")');

    // Select e-commerce template
    await page.click('text=E-Commerce Store');
    await page.fill('input[name="storeName"]', 'My Store');
    await page.click('button:has-text("Create")');

    // Wait for build
    await page.waitForSelector('text=SUCCESS', { timeout: 60000 });

    // Import products
    await page.click('text=Products');
    await page.click('button:has-text("Import CSV")');
    // Note: File upload would require actual file

    // Verify store is accessible
    await page.click('text=Preview');
    await expect(page.locator('text=My Store')).toBeVisible();
  });

  test('UAT-6: Workflow Builder - Create Automation', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/workflows');
    await page.click('button:has-text("New Workflow")');

    // Add nodes
    await page.click('button:has-text("+ Webhook")');
    await page.click('button:has-text("+ Email")');
    await page.click('button:has-text("+ Database")');

    // Connect nodes
    // Note: This would require drag-and-drop simulation

    // Save workflow
    await page.click('button:has-text("Save Workflow")');
    await expect(page.locator('text=Workflow saved')).toBeVisible();

    // Enable workflow
    await page.click('input[type="checkbox"]');
    await expect(page.locator('text=Enabled')).toBeVisible();
  });

  test('UAT-7: Instant Playground - No Login Demo', async ({ page }) => {
    await page.goto('http://localhost:3000/playground');

    // Verify no login required
    await expect(page.locator('text=OmniForge Playground')).toBeVisible();
    await expect(page.locator('text=No signup required')).toBeVisible();

    // Enter idea
    await page.fill('textarea[placeholder*="idea"]', 'A simple todo app');
    await page.click('button:has-text("Build Now")');

    // Wait for build
    await page.waitForSelector('text=Building your app', { timeout: 10000 });
    await page.waitForSelector('text=Your app is ready', { timeout: 60000 });

    // Verify preview
    const iframe = page.frameLocator('iframe');
    await expect(iframe.locator('body')).toBeVisible();

    // Test sign up flow
    await page.click('button:has-text("Sign Up to Save")');
    await expect(page.locator('text=Sign Up')).toBeVisible();
  });

  test('UAT-8: Similar Ideas Discovery', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/ideas');
    await page.click('.idea-card:first-child');

    // Check for similar ideas
    await expect(page.locator('text=Similar Ideas')).toBeVisible();
    
    // Click on similar idea
    const similarCount = await page.locator('.similar-idea').count();
    if (similarCount > 0) {
      await page.click('.similar-idea:first-child');
      await expect(page.locator('h1')).toBeVisible(); // Should navigate to idea detail
    }
  });
});

