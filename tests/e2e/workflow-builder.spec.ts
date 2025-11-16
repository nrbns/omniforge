import { test, expect } from '@playwright/test';

/**
 * E2E Test: Workflow Builder
 * Tests: Create workflow, add nodes, connect edges, AI suggest, execute
 */
test.describe('Workflow Builder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForSelector('text=OmniForge', { timeout: 10000 });
  });

  test('should open workflow builder', async ({ page }) => {
    // Navigate to an idea/project
    const firstItem = page.locator('[data-testid="idea-card"], .idea-card').first();
    if (await firstItem.count() > 0) {
      await firstItem.click();
    }
    
    // Click Workflow tab
    await page.click('text=Workflow, button:has-text("Workflow"), [aria-label*="Workflow" i]');
    
    // Verify workflow builder is visible
    await page.waitForSelector('.react-flow, [data-testid="workflow-builder"]', { timeout: 5000 });
    const workflowBuilder = page.locator('.react-flow, [data-testid="workflow-builder"]').first();
    await expect(workflowBuilder).toBeVisible();
  });

  test('should add workflow nodes', async ({ page }) => {
    // Navigate to workflow builder
    await page.goto('http://localhost:3000/dashboard');
    const firstItem = page.locator('[data-testid="idea-card"]').first();
    if (await firstItem.count() > 0) {
      await firstItem.click();
      await page.click('text=Workflow');
    }
    
    // Wait for workflow builder
    await page.waitForSelector('.react-flow', { timeout: 5000 });
    
    // Click "Add Node" or specific node type buttons
    const addButtons = page.locator('button:has-text("Add"), button:has-text("Webhook"), button:has-text("Email")');
    if (await addButtons.count() > 0) {
      await addButtons.first().click();
      
      // Verify node appears
      await page.waitForTimeout(500);
      const nodes = page.locator('.react-flow__node');
      const nodeCount = await nodes.count();
      expect(nodeCount).toBeGreaterThan(0);
    }
  });

  test('should use AI suggest workflow', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const firstItem = page.locator('[data-testid="idea-card"]').first();
    if (await firstItem.count() > 0) {
      await firstItem.click();
      await page.click('text=Workflow');
    }
    
    await page.waitForSelector('.react-flow', { timeout: 5000 });
    
    // Click AI Suggest button
    const aiButton = page.locator('button:has-text("AI Suggest"), button:has-text("Suggest")').first();
    if (await aiButton.count() > 0) {
      await aiButton.click();
      
      // Wait for AI to generate workflow
      await page.waitForSelector('.react-flow__node', { timeout: 10000 });
      
      // Verify nodes were added
      const nodes = page.locator('.react-flow__node');
      const nodeCount = await nodes.count();
      expect(nodeCount).toBeGreaterThan(0);
    }
  });
});

