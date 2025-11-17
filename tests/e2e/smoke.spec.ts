import { test, expect } from '@playwright/test';

/**
 * Smoke Tests - Critical path verification
 * Fast tests that verify core functionality works
 */
test.describe('Smoke Tests', () => {
  test('SMOKE-1: App loads and renders', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('text=OmniForge').or(page.locator('text=Dashboard'))).toBeVisible();
  });

  test('SMOKE-2: API health check', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/health');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('ok');
  });

  test('SMOKE-3: Database connection', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/health/db');
    expect(response.status()).toBe(200);
  });

  test('SMOKE-4: Create idea endpoint', async ({ request }) => {
    const response = await request.post('http://localhost:3001/api/ideas', {
      data: {
        title: 'Smoke Test Idea',
        description: 'Test description',
        userId: 'test-user',
      },
    });
    expect(response.status()).toBe(201);
    const idea = await response.json();
    expect(idea.id).toBeTruthy();
    expect(idea.title).toBe('Smoke Test Idea');
  });

  test('SMOKE-5: Get ideas list', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/ideas');
    expect(response.status()).toBe(200);
    const ideas = await response.json();
    expect(Array.isArray(ideas)).toBe(true);
  });

  test('SMOKE-6: Frontend routes load', async ({ page }) => {
    const routes = ['/dashboard', '/dashboard/ideas', '/dashboard/projects', '/playground'];
    
    for (const route of routes) {
      await page.goto(`http://localhost:3000${route}`);
      await expect(page.locator('body')).toBeVisible();
      // Should not show error page
      await expect(page.locator('text=404').or(page.locator('text=Error'))).not.toBeVisible();
    }
  });

  test('SMOKE-7: WebSocket connection', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Check for WebSocket connection in console
    const wsConnected = await page.evaluate(() => {
      return new Promise((resolve) => {
        const ws = new WebSocket('ws://localhost:3001');
        ws.onopen = () => {
          ws.close();
          resolve(true);
        };
        ws.onerror = () => resolve(false);
        setTimeout(() => resolve(false), 5000);
      });
    });
    
    expect(wsConnected).toBe(true);
  });

  test('SMOKE-8: Authentication flow (if implemented)', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Check if auth is required or if playground is accessible
    const hasAuth = await page.locator('text=Sign In').or(page.locator('text=Login')).count();
    const hasPlayground = await page.locator('a[href="/playground"]').count();
    
    // At least one should be available
    expect(hasAuth > 0 || hasPlayground > 0).toBe(true);
  });
});

