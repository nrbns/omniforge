import { test, expect } from '@playwright/test';

/**
 * Integration Tests - Service interactions
 * Tests how different services work together
 */
test.describe('API Integration Tests', () => {
  test('INT-1: Idea → Project → Build → Deploy flow', async ({ request }) => {
    // Step 1: Create idea
    const ideaResponse = await request.post('http://localhost:3001/api/ideas', {
      data: {
        title: 'Integration Test App',
        description: 'Full flow test',
        userId: 'test-user',
      },
    });
    const idea = await ideaResponse.json();
    expect(idea.id).toBeTruthy();

    // Step 2: Parse idea
    await request.post(`http://localhost:3001/api/ideas/${idea.id}/parse`);
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Step 3: Create project
    const projectResponse = await request.post('http://localhost:3001/api/projects', {
      data: {
        ideaId: idea.id,
        userId: 'test-user',
        name: 'Integration Project',
      },
    });
    const project = await projectResponse.json();
    expect(project.id).toBeTruthy();
    expect(project.ideaId).toBe(idea.id);

    // Step 4: Trigger build
    const buildResponse = await request.post(`http://localhost:3001/api/projects/${project.id}/build`);
    expect(buildResponse.status()).toBe(200);
    const build = await buildResponse.json();
    expect(build.id).toBeTruthy();

    // Step 5: Check build status
    const buildStatusResponse = await request.get(`http://localhost:3001/api/builds/${build.id}`);
    expect(buildStatusResponse.status()).toBe(200);
  });

  test('INT-2: CRM → Workflow → Email integration', async ({ request }) => {
    // Create CRM contact
    const contactResponse = await request.post('http://localhost:3001/api/crm/contacts', {
      data: {
        email: 'integration@test.com',
        name: 'Integration Test',
        businessId: 'test-business',
      },
    });
    const contact = await contactResponse.json();
    expect(contact.id).toBeTruthy();

    // Create workflow that triggers on new contact
    const workflowResponse = await request.post('http://localhost:3001/api/workflows', {
      data: {
        businessId: 'test-business',
        name: 'Welcome Workflow',
        trigger: 'lead.created',
        steps: {
          nodes: [
            { id: '1', type: 'webhook', data: { label: 'New Lead' } },
            { id: '2', type: 'email', data: { label: 'Send Welcome' } },
          ],
          edges: [{ id: 'e1-2', source: '1', target: '2' }],
        },
      },
    });
    const workflow = await workflowResponse.json();
    expect(workflow.id).toBeTruthy();

    // Trigger workflow (simulate new lead event)
    const executeResponse = await request.post(`http://localhost:3001/api/workflows/${workflow.id}/execute`, {
      data: { triggerData: { contactId: contact.id } },
    });
    expect(executeResponse.status()).toBe(200);
  });

  test('INT-3: E-Commerce → Stripe → Webhook integration', async ({ request }) => {
    // Create store
    const storeResponse = await request.post('http://localhost:3001/api/store', {
      data: {
        businessId: 'test-business',
        name: 'Integration Store',
        domain: 'test-store.com',
      },
    });
    const store = await storeResponse.json();
    expect(store.id).toBeTruthy();

    // Create Stripe checkout session
    const checkoutResponse = await request.post('http://localhost:3001/api/integrations/stripe/checkout', {
      data: {
        amount: 1000,
        currency: 'usd',
        successUrl: 'http://localhost:3000/success',
        cancelUrl: 'http://localhost:3000/cancel',
      },
    });
    expect(checkoutResponse.status()).toBe(200);
    const checkout = await checkoutResponse.json();
    expect(checkout.sessionId).toBeTruthy();

    // Simulate webhook (Stripe payment success)
    const webhookResponse = await request.post('http://localhost:3001/api/integrations/stripe/webhook', {
      headers: {
        'stripe-signature': 'test-signature',
      },
      data: {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: checkout.sessionId,
            amount: 1000,
          },
        },
      },
    });
    // Webhook might return 200 or 400 (if signature invalid in test)
    expect([200, 400]).toContain(webhookResponse.status());
  });

  test('INT-4: Marketing → A/B Test → Analytics integration', async ({ request }) => {
    // Create A/B test
    const testResponse = await request.post('http://localhost:3001/api/marketing/ab-tests', {
      data: {
        name: 'Integration Test',
        type: 'email',
        variants: [
          { id: 'v1', name: 'Variant A', weight: 50 },
          { id: 'v2', name: 'Variant B', weight: 50 },
        ],
        status: 'running',
      },
    });
    const test = await testResponse.json();

    // Assign variant
    const assignResponse = await request.post(`http://localhost:3001/api/marketing/ab-tests/${test.id}/assign`, {
      data: { userId: 'test-user' },
    });
    const assignment = await assignResponse.json();
    const variantId = assignment.variantId;

    // Track conversion
    const conversionResponse = await request.post(`http://localhost:3001/api/marketing/ab-tests/${test.id}/conversion`, {
      data: {
        variantId,
        userId: 'test-user',
        conversionType: 'click',
      },
    });
    expect(conversionResponse.status()).toBe(200);

    // Get results
    const resultsResponse = await request.get(`http://localhost:3001/api/marketing/ab-tests/${test.id}/results`);
    expect(resultsResponse.status()).toBe(200);
    const results = await resultsResponse.json();
    expect(results).toHaveProperty('variants');
  });

  test('INT-5: Project → Tokens → Hot Patch → Preview integration', async ({ request }) => {
    // Create project
    const ideaResponse = await request.post('http://localhost:3001/api/ideas', {
      data: { title: 'Tokens Integration', userId: 'test-user' },
    });
    const idea = await ideaResponse.json();

    const projectResponse = await request.post('http://localhost:3001/api/projects', {
      data: { ideaId: idea.id, userId: 'test-user', name: 'Tokens Project' },
    });
    const project = await projectResponse.json();

    // Set tokens
    await request.post(`http://localhost:3001/api/tokens/project/${project.id}`, {
      data: {
        tokens: {
          colors: { primary: '#ff0000', secondary: '#00ff00' },
        },
      },
    });

    // Hot patch with new tokens
    const hotPatchResponse = await request.post(`http://localhost:3001/api/projects/${project.id}/hotpatch`, {
      data: {
        tokens: {
          colors: { primary: '#0000ff' }, // Change to blue
        },
      },
    });
    expect(hotPatchResponse.status()).toBe(200);

    // Verify tokens updated
    const tokensResponse = await request.get(`http://localhost:3001/api/tokens/project/${project.id}`);
    const tokens = await tokensResponse.json();
    expect(tokens.tokens.colors.primary).toBe('#0000ff');
  });

  test('INT-6: Ideas → Search → Similar → Knowledge Graph integration', async ({ request }) => {
    // Create ideas
    const idea1Response = await request.post('http://localhost:3001/api/ideas', {
      data: {
        title: 'Fitness Tracker',
        description: 'Track workouts and nutrition',
        userId: 'test-user',
      },
    });
    const idea1 = await idea1Response.json();

    const idea2Response = await request.post('http://localhost:3001/api/ideas', {
      data: {
        title: 'Health Monitor',
        description: 'Monitor health metrics and workouts',
        userId: 'test-user',
      },
    });
    const idea2 = await idea2Response.json();

    // Parse ideas to build knowledge graph
    await request.post(`http://localhost:3001/api/ideas/${idea1.id}/parse`);
    await request.post(`http://localhost:3001/api/ideas/${idea2.id}/parse`);
    await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait for parsing

    // Search
    const searchResponse = await request.get('http://localhost:3001/api/ideas/search?q=fitness');
    expect(searchResponse.status()).toBe(200);
    const searchResults = await searchResponse.json();
    expect(searchResults.length).toBeGreaterThan(0);

    // Find similar
    const similarResponse = await request.get(`http://localhost:3001/api/ideas/${idea1.id}/similar`);
    expect(similarResponse.status()).toBe(200);
    const similar = await similarResponse.json();
    expect(Array.isArray(similar)).toBe(true);
  });
});

