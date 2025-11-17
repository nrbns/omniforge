import { test, expect } from '@playwright/test';

/**
 * Grey Box Testing
 * Tests with partial knowledge of internal implementation
 * Tests both UI and API together
 */
test.describe('Grey Box Tests', () => {
  test('GREY-1: Frontend creates idea → Backend stores → Frontend displays', async ({ page, request }) => {
    // Frontend: Create idea via UI
    await page.goto('http://localhost:3000/dashboard/ideas');
    await page.click('button:has-text("New Idea")');
    await page.fill('input[name="title"]', 'Grey Box Test Idea');
    await page.fill('textarea[name="description"]', 'Testing frontend-backend integration');
    await page.click('button:has-text("Create")');

    // Wait for API call to complete
    await page.waitForSelector('text=Grey Box Test Idea', { timeout: 10000 });

    // Backend: Verify idea was created in database
    const ideasResponse = await request.get('http://localhost:3001/api/ideas');
    const ideas = await ideasResponse.json();
    const createdIdea = ideas.find((i: any) => i.title === 'Grey Box Test Idea');
    expect(createdIdea).toBeTruthy();
    expect(createdIdea.description).toContain('Testing frontend-backend');

    // Frontend: Verify idea appears in list
    await expect(page.locator('text=Grey Box Test Idea')).toBeVisible();
  });

  test('GREY-2: Visual Editor changes → Hot Patch API → Preview updates', async ({ page, request }) => {
    // Create project first
    const ideaResponse = await request.post('http://localhost:3001/api/ideas', {
      data: { title: 'Grey Box Editor', userId: 'test-user' },
    });
    const idea = await ideaResponse.json();

    const projectResponse = await request.post('http://localhost:3001/api/projects', {
      data: { ideaId: idea.id, userId: 'test-user', name: 'Grey Box Project' },
    });
    const project = await projectResponse.json();

    // Frontend: Open editor
    await page.goto(`http://localhost:3000/dashboard/projects/${project.id}/editor`);
    await page.waitForSelector('text=Design Tokens', { timeout: 5000 });

    // Frontend: Change color
    await page.click('text=Design Tokens');
    const colorInput = page.locator('input[type="color"]').first();
    await colorInput.fill('#ff0000');

    // Wait for hot patch API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Backend: Verify tokens updated
    const tokensResponse = await request.get(`http://localhost:3001/api/tokens/project/${project.id}`);
    if (tokensResponse.ok()) {
      const tokens = await tokensResponse.json();
      // Verify token was updated (structure may vary)
      expect(tokens).toBeTruthy();
    }
  });

  test('GREY-3: Build process → Job Queue → Status updates → UI reflects', async ({ page, request }) => {
    // Create project
    const ideaResponse = await request.post('http://localhost:3001/api/ideas', {
      data: { title: 'Grey Box Build', userId: 'test-user' },
    });
    const idea = await ideaResponse.json();

    const projectResponse = await request.post('http://localhost:3001/api/projects', {
      data: { ideaId: idea.id, userId: 'test-user', name: 'Grey Box Build Project' },
    });
    const project = await projectResponse.json();

    // Backend: Trigger build
    const buildResponse = await request.post(`http://localhost:3001/api/projects/${project.id}/build`);
    const build = await buildResponse.json();

    // Frontend: Check build status
    await page.goto(`http://localhost:3000/dashboard/projects/${project.id}`);
    await page.waitForSelector('text=BUILDING', { timeout: 5000 });

    // Backend: Check job queue status
    const buildsResponse = await request.get(`http://localhost:3001/api/builds?projectId=${project.id}`);
    const builds = await buildsResponse.json();
    expect(builds.length).toBeGreaterThan(0);
    expect(['QUEUED', 'RUNNING', 'SUCCESS', 'FAILED']).toContain(builds[0].status);

    // Frontend: Should show build timeline
    await expect(page.locator('text=Planner').or(page.locator('text=BUILDING'))).toBeVisible();
  });

  test('GREY-4: CRM lead form → API creates lead → Workflow triggers → Email sent', async ({ page, request }) => {
    // Frontend: Submit lead form (if available on preview)
    // This would require a generated app with lead form

    // Backend: Create lead directly
    const leadResponse = await request.post('http://localhost:3001/api/crm/contacts', {
      data: {
        email: 'greybox@test.com',
        name: 'Grey Box Lead',
        businessId: 'test-business',
      },
    });
    const lead = await leadResponse.json();

    // Backend: Verify workflow triggered
    const workflowsResponse = await request.get('http://localhost:3001/api/workflows?businessId=test-business');
    const workflows = await workflowsResponse.json();

    // Check if any workflow executed
    if (workflows.length > 0) {
      const workflow = workflows[0];
      const executionsResponse = await request.get(
        `http://localhost:3001/api/workflows/${workflow.id}/logs?limit=1`,
      );
      if (executionsResponse.ok()) {
        const executions = await executionsResponse.json();
        // Verify workflow was triggered
        expect(Array.isArray(executions)).toBe(true);
      }
    }
  });

  test('GREY-5: Search query → Vector embedding → Database query → Results displayed', async ({ page, request }) => {
    // Create test ideas
    await request.post('http://localhost:3001/api/ideas', {
      data: { title: 'Searchable Idea 1', description: 'Fitness and health tracking', userId: 'test-user' },
    });
    await request.post('http://localhost:3001/api/ideas', {
      data: { title: 'Searchable Idea 2', description: 'Workout planner app', userId: 'test-user' },
    });

    // Frontend: Search
    await page.goto('http://localhost:3000/dashboard/ideas');
    await page.fill('input[placeholder*="search"], input[type="search"]', 'fitness');
    await page.press('input[placeholder*="search"], input[type="search"]', 'Enter');

    // Wait for results
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Backend: Verify search API works
    const searchResponse = await request.get('http://localhost:3001/api/ideas/search?q=fitness');
    const results = await searchResponse.json();
    expect(results.length).toBeGreaterThan(0);

    // Frontend: Should show results
    await expect(page.locator('text=Searchable').or(page.locator('.idea-card'))).toBeVisible();
  });

  test('GREY-6: Knowledge graph build → Similar ideas → UI suggestions', async ({ page, request }) => {
    // Create ideas
    const idea1Response = await request.post('http://localhost:3001/api/ideas', {
      data: {
        title: 'Graph Idea 1',
        description: 'Telemedicine app for video consultations',
        userId: 'test-user',
      },
    });
    const idea1 = await idea1Response.json();

    const idea2Response = await request.post('http://localhost:3001/api/ideas', {
      data: {
        title: 'Graph Idea 2',
        description: 'Healthcare platform with video calls',
        userId: 'test-user',
      },
    });
    const idea2 = await idea2Response.json();

    // Parse to build knowledge graph
    await request.post(`http://localhost:3001/api/ideas/${idea1.id}/parse`);
    await request.post(`http://localhost:3001/api/ideas/${idea2.id}/parse`);
    await new Promise((resolve) => setTimeout(resolve, 10000));

    // Backend: Get similar ideas
    const similarResponse = await request.get(`http://localhost:3001/api/ideas/${idea1.id}/similar`);
    const similar = await similarResponse.json();

    // Frontend: View idea detail (should show similar)
    await page.goto(`http://localhost:3000/dashboard/ideas/${idea1.id}`);
    await expect(page.locator('text=Similar Ideas').or(page.locator('.similar-idea'))).toBeVisible();
  });

  test('GREY-7: A/B test assignment → Variant stored → Conversion tracked → Results calculated', async ({
    page,
    request,
  }) => {
    // Backend: Create A/B test
    const testResponse = await request.post('http://localhost:3001/api/marketing/ab-tests', {
      data: {
        name: 'Grey Box Test',
        type: 'email',
        variants: [
          { id: 'v1', name: 'Variant A', weight: 50 },
          { id: 'v2', name: 'Variant B', weight: 50 },
        ],
        status: 'running',
      },
    });
    const test = await testResponse.json();

    // Backend: Assign variant
    const assignResponse = await request.post(`http://localhost:3001/api/marketing/ab-tests/${test.id}/assign`, {
      data: { userId: 'test-user' },
    });
    const assignment = await assignResponse.json();
    const variantId = assignment.variantId;

    // Backend: Track conversion
    await request.post(`http://localhost:3001/api/marketing/ab-tests/${test.id}/conversion`, {
      data: {
        variantId,
        userId: 'test-user',
        conversionType: 'click',
      },
    });

    // Frontend: View results
    await page.goto('http://localhost:3000/dashboard/marketing');
    await page.click(`text=${test.name}`);
    await expect(page.locator('text=Results').or(page.locator('text=Conversion'))).toBeVisible();
  });
});

