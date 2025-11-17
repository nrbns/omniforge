import { test, expect } from '@playwright/test';

/**
 * Regression Tests - Prevent breaking changes
 * Tests that previously working features still work
 */
test.describe('Regression Tests', () => {
  test('REG-1: Previously created ideas still accessible', async ({ request }) => {
    // Create idea
    const createResponse = await request.post('http://localhost:3001/api/ideas', {
      data: {
        title: 'Regression Test Idea',
        description: 'This should persist',
        userId: 'test-user',
      },
    });
    const idea = await createResponse.json();
    const ideaId = idea.id;

    // Wait a bit
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Verify still accessible
    const getResponse = await request.get(`http://localhost:3001/api/ideas/${ideaId}`);
    expect(getResponse.status()).toBe(200);
    const fetched = await getResponse.json();
    expect(fetched.id).toBe(ideaId);
    expect(fetched.title).toBe('Regression Test Idea');
  });

  test('REG-2: Project build still works after code changes', async ({ request }) => {
    // Create idea and project
    const ideaResponse = await request.post('http://localhost:3001/api/ideas', {
      data: { title: 'Regression Build', userId: 'test-user' },
    });
    const idea = await ideaResponse.json();

    const projectResponse = await request.post('http://localhost:3001/api/projects', {
      data: { ideaId: idea.id, userId: 'test-user', name: 'Regression Project' },
    });
    const project = await projectResponse.json();

    // Build should still work
    const buildResponse = await request.post(`http://localhost:3001/api/projects/${project.id}/build`);
    expect(buildResponse.status()).toBe(200);
  });

  test('REG-3: API response format unchanged', async ({ request }) => {
    // Create idea
    const createResponse = await request.post('http://localhost:3001/api/ideas', {
      data: { title: 'Format Test', userId: 'test-user' },
    });
    const idea = await createResponse.json();

    // Verify response structure
    expect(idea).toHaveProperty('id');
    expect(idea).toHaveProperty('title');
    expect(idea).toHaveProperty('status');
    expect(idea).toHaveProperty('createdAt');
  });

  test('REG-4: Frontend routes still work', async ({ page }) => {
    const routes = [
      '/dashboard',
      '/dashboard/ideas',
      '/dashboard/projects',
      '/dashboard/crm',
      '/dashboard/marketing',
      '/dashboard/workflows',
      '/playground',
    ];

    for (const route of routes) {
      const response = await page.goto(`http://localhost:3000${route}`);
      expect(response?.status()).toBeLessThan(400);
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('REG-5: Database schema compatibility', async ({ request }) => {
    // Create idea with all fields
    const createResponse = await request.post('http://localhost:3001/api/ideas', {
      data: {
        title: 'Schema Test',
        description: 'Test description',
        rawInput: 'Raw input text',
        userId: 'test-user',
      },
    });
    expect(createResponse.status()).toBe(201);

    // Update with spec
    const idea = await createResponse.json();
    const updateResponse = await request.put(`http://localhost:3001/api/ideas/${idea.id}`, {
      data: {
        specJson: {
          pages: [{ name: 'Home', path: '/' }],
          dataModels: [],
        },
      },
    });
    expect(updateResponse.status()).toBe(200);
  });

  test('REG-6: WebSocket real-time still works', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    // Check WebSocket connection
    const wsStatus = await page.evaluate(() => {
      return new Promise((resolve) => {
        const ws = new WebSocket('ws://localhost:3001');
        ws.onopen = () => {
          ws.send(JSON.stringify({ type: 'ping' }));
          ws.close();
          resolve('connected');
        };
        ws.onerror = () => resolve('error');
        setTimeout(() => resolve('timeout'), 5000);
      });
    });

    expect(wsStatus).toBe('connected');
  });

  test('REG-7: Error handling still works', async ({ request }) => {
    // Test 404
    const notFoundResponse = await request.get('http://localhost:3001/api/ideas/non-existent-id');
    expect(notFoundResponse.status()).toBe(404);

    // Test 400 (invalid data)
    const badRequestResponse = await request.post('http://localhost:3001/api/ideas', {
      data: { /* missing required fields */ },
    });
    expect([400, 422]).toContain(badRequestResponse.status());
  });

  test('REG-8: Pagination still works', async ({ request }) => {
    // Create multiple ideas
    for (let i = 0; i < 5; i++) {
      await request.post('http://localhost:3001/api/ideas', {
        data: { title: `Pagination Test ${i}`, userId: 'test-user' },
      });
    }

    // Get with pagination
    const response = await request.get('http://localhost:3001/api/ideas?limit=2');
    expect(response.status()).toBe(200);
    const ideas = await response.json();
    expect(ideas.length).toBeLessThanOrEqual(2);
  });
});

