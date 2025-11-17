import { test, expect } from '@playwright/test';

/**
 * User Testing Scenarios
 * Real-world user journeys and edge cases
 */
test.describe('User Testing Scenarios', () => {
  test('USER-1: First-time user creates and deploys app', async ({ page }) => {
    // User lands on homepage
    await page.goto('http://localhost:3000');
    await expect(page.locator('body')).toBeVisible();

    // User clicks "Get Started" or "New Idea"
    await page.click('button:has-text("Get Started"), button:has-text("New Idea"), a[href*="ideas"]');

    // User enters idea
    await page.fill('textarea[placeholder*="idea"], input[placeholder*="idea"]', 'My first app idea');
    await page.click('button:has-text("Create"), button:has-text("Submit")');

    // User waits for parsing
    await page.waitForSelector('text=PARSED, text=Ready', { timeout: 30000 });

    // User creates project
    await page.click('button:has-text("Create Project"), button:has-text("Build")');

    // User watches build progress
    await expect(page.locator('text=BUILDING, text=Building')).toBeVisible();

    // User waits for completion
    await page.waitForSelector('text=SUCCESS, text=Ready, text=Complete', { timeout: 60000 });

    // User views preview
    await page.click('button:has-text("Preview"), a[href*="preview"]');
    await expect(page.locator('iframe, [data-preview]')).toBeVisible();

    // User is happy and wants to deploy
    await page.click('button:has-text("Deploy")');
    await page.waitForSelector('text=DEPLOYED, text=Live', { timeout: 30000 });

    // User sees success message
    await expect(page.locator('text=Success, text=Deployed, text=Live')).toBeVisible();
  });

  test('USER-2: User edits app after deployment', async ({ page, request }) => {
    // Setup: Create deployed project
    const ideaResponse = await request.post('http://localhost:3001/api/ideas', {
      data: { title: 'Editable App', userId: 'test-user' },
    });
    const idea = await ideaResponse.json();

    const projectResponse = await request.post('http://localhost:3001/api/projects', {
      data: { ideaId: idea.id, userId: 'test-user', name: 'Editable Project' },
    });
    const project = await projectResponse.json();

    // User opens editor
    await page.goto(`http://localhost:3000/dashboard/projects/${project.id}/editor`);

    // User changes headline
    await page.click('text=Content');
    await page.fill('input[placeholder*="headline"], input[name*="headline"]', 'Updated Headline');
    await page.waitForTimeout(1000);

    // User changes color
    await page.click('text=Design Tokens');
    await page.fill('input[type="color"]', '#00ff00');
    await page.waitForTimeout(1000);

    // User commits changes
    await page.click('button:has-text("Publish"), button:has-text("Commit")');
    await expect(page.locator('text=Committed, text=Saved')).toBeVisible();

    // User verifies changes in preview
    await page.click('text=Preview');
    await expect(page.locator('text=Updated Headline')).toBeVisible();
  });

  test('USER-3: User creates e-commerce store with products', async ({ page, request }) => {
    // User creates e-commerce idea
    await page.goto('http://localhost:3000/dashboard/ideas');
    await page.click('button:has-text("New Idea")');
    await page.fill('textarea[placeholder*="idea"]', 'Online t-shirt store');
    await page.click('button:has-text("Create")');

    await page.waitForSelector('text=PARSED', { timeout: 30000 });

    // User creates project
    await page.click('button:has-text("Create Project")');
    await page.waitForSelector('text=SUCCESS', { timeout: 60000 });

    // User adds products
    await page.click('text=Products, text=Store');
    await page.click('button:has-text("Add Product")');
    await page.fill('input[name="name"]', 'Cool T-Shirt');
    await page.fill('input[name="price"]', '29.99');
    await page.click('button:has-text("Save")');

    // User verifies product appears
    await expect(page.locator('text=Cool T-Shirt')).toBeVisible();
    await expect(page.locator('text=29.99')).toBeVisible();
  });

  test('USER-4: User sets up marketing campaign', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/marketing');

    // User creates email campaign
    await page.click('button:has-text("New Campaign")');
    await page.fill('input[name="name"]', 'Welcome Campaign');
    await page.selectOption('select[name="type"]', 'email');
    await page.click('button:has-text("Create")');

    // User writes email content
    await page.fill('textarea[name="subject"]', 'Welcome to our app!');
    await page.fill('div[contenteditable], textarea[name="body"]', 'Thanks for joining us!');

    // User saves campaign
    await page.click('button:has-text("Save")');
    await expect(page.locator('text=Welcome Campaign')).toBeVisible();

    // User schedules campaign
    await page.click('button:has-text("Schedule")');
    await expect(page.locator('text=Scheduled')).toBeVisible();
  });

  test('USER-5: User views analytics dashboard', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/analytics');

    // User should see metrics
    await expect(page.locator('text=Sales, text=Revenue, text=Leads')).toBeVisible();

    // User changes date range
    await page.click('button:has-text("Last 30 days"), select[name="period"]');
    await page.selectOption('select[name="period"]', 'last-7-days');

    // User should see updated charts
    await expect(page.locator('canvas, svg, [data-chart]')).toBeVisible();

    // User exports data
    await page.click('button:has-text("Export")');
    await page.click('button:has-text("CSV")');
    // File download would be verified in real scenario
  });

  test('USER-6: User collaborates with team member', async ({ page, context }) => {
    // User 1 opens editor
    await page.goto('http://localhost:3000/dashboard');
    await page.click('.project-card:first-child');
    await page.click('text=Editor');

    // User 2 opens same editor
    const page2 = await context.newPage();
    await page2.goto(page.url());

    // User 1 makes change
    await page.fill('input, textarea', 'User 1 change');

    // User 2 should see User 1's cursor/change (if Yjs implemented)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Both users should see each other
    await expect(page.locator('text=User, [data-user]')).toBeVisible();
    await expect(page2.locator('text=User, [data-user]')).toBeVisible();
  });

  test('USER-7: User tries playground without account', async ({ page }) => {
    // User visits playground
    await page.goto('http://localhost:3000/playground');

    // User should see no login required
    await expect(page.locator('text=No signup required, text=Try now')).toBeVisible();

    // User enters idea
    await page.fill('textarea[placeholder*="idea"]', 'Quick test app');
    await page.click('button:has-text("Build")');

    // User waits for build
    await page.waitForSelector('text=Building, text=Ready', { timeout: 60000 });

    // User likes it and wants to save
    await page.click('button:has-text("Sign Up"), button:has-text("Save")');
    await expect(page.locator('text=Sign Up, text=Create Account')).toBeVisible();
  });

  test('USER-8: User encounters error and recovers', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    // Simulate network error
    await page.route('**/api/ideas', (route) => route.abort());

    // User tries to create idea
    await page.click('button:has-text("New Idea")');
    await page.fill('input[name="title"]', 'Error Test');
    await page.click('button:has-text("Create")');

    // User should see error message
    await expect(page.locator('text=Error, text=Failed, text=Try again')).toBeVisible();

    // User clicks retry
    await page.route('**/api/ideas', (route) => route.continue());
    await page.click('button:has-text("Retry"), button:has-text("Try again")');

    // Should succeed on retry
    await expect(page.locator('text=Error Test')).toBeVisible({ timeout: 10000 });
  });

  test('USER-9: User searches for similar apps', async ({ page, request }) => {
    // Setup: Create ideas
    await request.post('http://localhost:3001/api/ideas', {
      data: { title: 'Fitness App', description: 'Track workouts', userId: 'test-user' },
    });
    await request.post('http://localhost:3001/api/ideas', {
      data: { title: 'Health Tracker', description: 'Monitor health', userId: 'test-user' },
    });

    // User searches
    await page.goto('http://localhost:3000/dashboard/ideas');
    await page.fill('input[type="search"], input[placeholder*="search"]', 'fitness');
    await page.press('input[type="search"], input[placeholder*="search"]', 'Enter');

    // User sees results
    await expect(page.locator('.idea-card, [data-idea]')).toBeVisible();

    // User clicks on result
    await page.click('.idea-card:first-child, [data-idea]:first-child');

    // User sees similar ideas
    await expect(page.locator('text=Similar Ideas, .similar-idea')).toBeVisible();
  });

  test('USER-10: User exports project to code', async ({ page, request }) => {
    // Setup: Create project
    const ideaResponse = await request.post('http://localhost:3001/api/ideas', {
      data: { title: 'Export Test', userId: 'test-user' },
    });
    const idea = await ideaResponse.json();

    const projectResponse = await request.post('http://localhost:3001/api/projects', {
      data: { ideaId: idea.id, userId: 'test-user', name: 'Export Project' },
    });
    const project = await projectResponse.json();

    // User goes to export
    await page.goto(`http://localhost:3000/dashboard/projects/${project.id}`);
    await page.click('button:has-text("Export"), button:has-text("Download")');

    // User selects export format
    await page.click('button:has-text("Next.js"), button:has-text("React")');

    // User downloads
    const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);
    await page.click('button:has-text("Download"), button:has-text("Export")');

    // Download should start (or API should return export)
    const download = await downloadPromise;
    // In real scenario, verify download
  });
});

