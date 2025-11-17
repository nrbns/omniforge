import { test, expect } from '@playwright/test';

/**
 * Functionality Tests - All features work as expected
 */
test.describe('Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('FUNC-1: Idea CRUD operations', async ({ page, request }) => {
    // Create
    const createResponse = await request.post('http://localhost:3001/api/ideas', {
      data: {
        title: 'Test Idea',
        description: 'Test description',
        userId: 'test-user',
      },
    });
    expect(createResponse.status()).toBe(201);
    const idea = await createResponse.json();
    const ideaId = idea.id;

    // Read
    const getResponse = await request.get(`http://localhost:3001/api/ideas/${ideaId}`);
    expect(getResponse.status()).toBe(200);
    const fetchedIdea = await getResponse.json();
    expect(fetchedIdea.title).toBe('Test Idea');

    // Update
    const updateResponse = await request.put(`http://localhost:3001/api/ideas/${ideaId}`, {
      data: { title: 'Updated Idea' },
    });
    expect(updateResponse.status()).toBe(200);
    const updatedIdea = await updateResponse.json();
    expect(updatedIdea.title).toBe('Updated Idea');

    // Delete (if endpoint exists)
    // const deleteResponse = await request.delete(`http://localhost:3001/api/ideas/${ideaId}`);
    // expect(deleteResponse.status()).toBe(200);
  });

  test('FUNC-2: Idea parsing generates spec', async ({ request }) => {
    // Create idea
    const createResponse = await request.post('http://localhost:3001/api/ideas', {
      data: {
        title: 'Telemedicine App',
        description: 'App for video consultations with doctors',
        userId: 'test-user',
      },
    });
    const idea = await createResponse.json();

    // Parse idea
    const parseResponse = await request.post(`http://localhost:3001/api/ideas/${idea.id}/parse`);
    expect(parseResponse.status()).toBe(200);

    // Wait for parsing
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Get spec
    const specResponse = await request.get(`http://localhost:3001/api/ideas/${idea.id}/spec`);
    expect(specResponse.status()).toBe(200);
    const spec = await specResponse.json();
    expect(spec.spec).toBeTruthy();
    expect(spec.spec.pages).toBeDefined();
  });

  test('FUNC-3: Project creation from idea', async ({ request }) => {
    // Create idea
    const ideaResponse = await request.post('http://localhost:3001/api/ideas', {
      data: {
        title: 'Test Project Idea',
        description: 'Test',
        userId: 'test-user',
      },
    });
    const idea = await ideaResponse.json();

    // Create project
    const projectResponse = await request.post('http://localhost:3001/api/projects', {
      data: {
        ideaId: idea.id,
        userId: 'test-user',
        name: 'Test Project',
      },
    });
    expect(projectResponse.status()).toBe(201);
    const project = await projectResponse.json();
    expect(project.id).toBeTruthy();
    expect(project.ideaId).toBe(idea.id);
  });

  test('FUNC-4: Build process completes', async ({ request }) => {
    // Create idea and project
    const ideaResponse = await request.post('http://localhost:3001/api/ideas', {
      data: {
        title: 'Build Test',
        description: 'Test build',
        userId: 'test-user',
      },
    });
    const idea = await ideaResponse.json();

    const projectResponse = await request.post('http://localhost:3001/api/projects', {
      data: {
        ideaId: idea.id,
        userId: 'test-user',
        name: 'Build Test Project',
      },
    });
    const project = await projectResponse.json();

    // Trigger build
    const buildResponse = await request.post(`http://localhost:3001/api/projects/${project.id}/build`);
    expect(buildResponse.status()).toBe(200);

    // Check build status (poll)
    let buildStatus = 'QUEUED';
    let attempts = 0;
    while (buildStatus !== 'SUCCESS' && buildStatus !== 'FAILED' && attempts < 30) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const statusResponse = await request.get(`http://localhost:3001/api/builds?projectId=${project.id}`);
      const builds = await statusResponse.json();
      if (builds.length > 0) {
        buildStatus = builds[0].status;
      }
      attempts++;
    }

    expect(['SUCCESS', 'FAILED']).toContain(buildStatus);
  });

  test('FUNC-5: Design tokens CRUD', async ({ request }) => {
    // Create project first
    const ideaResponse = await request.post('http://localhost:3001/api/ideas', {
      data: { title: 'Tokens Test', userId: 'test-user' },
    });
    const idea = await ideaResponse.json();

    const projectResponse = await request.post('http://localhost:3001/api/projects', {
      data: { ideaId: idea.id, userId: 'test-user', name: 'Tokens Project' },
    });
    const project = await projectResponse.json();

    // Create tokens
    const tokensResponse = await request.post(`http://localhost:3001/api/tokens/project/${project.id}`, {
      data: {
        tokens: {
          colors: { primary: '#ff0000' },
          spacing: { md: '1rem' },
        },
      },
    });
    expect(tokensResponse.status()).toBe(200);

    // Get tokens
    const getTokensResponse = await request.get(`http://localhost:3001/api/tokens/project/${project.id}`);
    expect(getTokensResponse.status()).toBe(200);
    const tokens = await getTokensResponse.json();
    expect(tokens.tokens.colors.primary).toBe('#ff0000');
  });

  test('FUNC-6: CRM lead creation and scoring', async ({ request }) => {
    // Create lead
    const leadResponse = await request.post('http://localhost:3001/api/crm/contacts', {
      data: {
        email: 'lead@test.com',
        name: 'Test Lead',
        businessId: 'test-business',
      },
    });
    expect(leadResponse.status()).toBe(201);
    const lead = await leadResponse.json();

    // Calculate score
    const scoreResponse = await request.post(`http://localhost:3001/api/crm/leads/${lead.id}/score`, {
      data: {
        emailOpened: true,
        formSubmitted: true,
        websiteVisited: true,
      },
    });
    expect(scoreResponse.status()).toBe(200);
    const scoreData = await scoreResponse.json();
    expect(scoreData.score).toBeGreaterThan(0);
    expect(scoreData.score).toBeLessThanOrEqual(100);
  });

  test('FUNC-7: Workflow creation and execution', async ({ request }) => {
    // Create workflow
    const workflowResponse = await request.post('http://localhost:3001/api/workflows', {
      data: {
        businessId: 'test-business',
        name: 'Test Workflow',
        trigger: 'webhook',
        steps: {
          nodes: [{ id: '1', type: 'webhook', data: { label: 'Start' } }],
          edges: [],
        },
      },
    });
    expect(workflowResponse.status()).toBe(201);
    const workflow = await workflowResponse.json();

    // Execute workflow
    const executeResponse = await request.post(`http://localhost:3001/api/workflows/${workflow.id}/execute`, {
      data: { triggerData: { test: 'data' } },
    });
    expect(executeResponse.status()).toBe(200);
  });

  test('FUNC-8: A/B test creation and assignment', async ({ request }) => {
    // Create A/B test
    const testResponse = await request.post('http://localhost:3001/api/marketing/ab-tests', {
      data: {
        name: 'Button Color Test',
        type: 'email',
        variants: [
          { id: 'v1', name: 'Blue', content: { color: 'blue' }, weight: 50 },
          { id: 'v2', name: 'Green', content: { color: 'green' }, weight: 50 },
        ],
        status: 'running',
      },
    });
    expect(testResponse.status()).toBe(200);
    const test = await testResponse.json();

    // Assign variant
    const assignResponse = await request.post(`http://localhost:3001/api/marketing/ab-tests/${test.id}/assign`, {
      data: { userId: 'test-user' },
    });
    expect(assignResponse.status()).toBe(200);
    const assignment = await assignResponse.json();
    expect(assignment.variantId).toBeTruthy();
  });

  test('FUNC-9: Search and similar ideas', async ({ request }) => {
    // Create multiple ideas
    const idea1 = await request.post('http://localhost:3001/api/ideas', {
      data: { title: 'Fitness App', description: 'Track workouts', userId: 'test-user' },
    });
    const idea1Data = await idea1.json();

    const idea2 = await request.post('http://localhost:3001/api/ideas', {
      data: { title: 'Health Tracker', description: 'Monitor health metrics', userId: 'test-user' },
    });
    const idea2Data = await idea2.json();

    // Search ideas
    const searchResponse = await request.get('http://localhost:3001/api/ideas/search?q=fitness');
    expect(searchResponse.status()).toBe(200);
    const results = await searchResponse.json();
    expect(results.length).toBeGreaterThan(0);

    // Find similar
    const similarResponse = await request.get(`http://localhost:3001/api/ideas/${idea1Data.id}/similar`);
    expect(similarResponse.status()).toBe(200);
    const similar = await similarResponse.json();
    expect(Array.isArray(similar)).toBe(true);
  });

  test('FUNC-10: Hot patch and commit changes', async ({ request }) => {
    // Create project
    const ideaResponse = await request.post('http://localhost:3001/api/ideas', {
      data: { title: 'Hot Patch Test', userId: 'test-user' },
    });
    const idea = await ideaResponse.json();

    const projectResponse = await request.post('http://localhost:3001/api/projects', {
      data: { ideaId: idea.id, userId: 'test-user', name: 'Hot Patch Project' },
    });
    const project = await projectResponse.json();

    // Hot patch
    const hotPatchResponse = await request.post(`http://localhost:3001/api/projects/${project.id}/hotpatch`, {
      data: {
        content: { hero: { headline: 'New Headline' } },
        tokens: { colors: { primary: '#00ff00' } },
      },
    });
    expect(hotPatchResponse.status()).toBe(200);

    // Commit changes
    const commitResponse = await request.post(`http://localhost:3001/api/projects/${project.id}/commit`, {
      data: {
        message: 'Test commit',
        content: { hero: { headline: 'Committed Headline' } },
      },
    });
    expect(commitResponse.status()).toBe(200);
  });
});

