import { test, expect } from '@playwright/test';

/**
 * E2E Test: Popup Builder
 * Tests: Create popup, configure triggers, AI generate, preview
 */
test.describe('Popup Builder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForSelector('text=OmniForge', { timeout: 10000 });
  });

  test('should open popup builder', async ({ page }) => {
    const firstItem = page.locator('[data-testid="idea-card"]').first();
    if (await firstItem.count() > 0) {
      await firstItem.click();
    }
    
    // Click Popup tab
    await page.click('text=Popup, button:has-text("Popup"), [aria-label*="Popup" i]');
    
    // Verify popup builder is visible
    await page.waitForSelector('[data-testid="popup-builder"], text=Popup Builder, text=Popup Type', { timeout: 5000 });
    const popupBuilder = page.locator('text=Popup Type, text=Trigger Settings').first();
    await expect(popupBuilder).toBeVisible();
  });

  test('should configure popup', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const firstItem = page.locator('[data-testid="idea-card"]').first();
    if (await firstItem.count() > 0) {
      await firstItem.click();
      await page.click('text=Popup');
    }
    
    await page.waitForSelector('text=Popup Type', { timeout: 5000 });
    
    // Select popup type
    const typeSelect = page.locator('select').first();
    if (await typeSelect.count() > 0) {
      await typeSelect.selectOption('exit-intent');
    }
    
    // Fill in title
    const titleInput = page.locator('input[placeholder*="Title" i], input[name*="title" i]').first();
    if (await titleInput.count() > 0) {
      await titleInput.fill('Special Offer!');
    }
    
    // Fill in message
    const messageInput = page.locator('textarea').first();
    if (await messageInput.count() > 0) {
      await messageInput.fill('Get 10% off your first order!');
    }
  });

  test('should AI generate popup', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const firstItem = page.locator('[data-testid="idea-card"]').first();
    if (await firstItem.count() > 0) {
      await firstItem.click();
      await page.click('text=Popup');
    }
    
    await page.waitForSelector('button:has-text("AI Generate"), button:has-text("Generate")', { timeout: 5000 });
    
    // Click AI Generate
    const aiButton = page.locator('button:has-text("AI Generate"), button:has-text("Generate")').first();
    if (await aiButton.count() > 0) {
      await aiButton.click();
      
      // Wait for AI to generate
      await page.waitForTimeout(3000);
      
      // Verify popup was generated (check for filled fields)
      const titleInput = page.locator('input[placeholder*="Title" i]').first();
      if (await titleInput.count() > 0) {
        const value = await titleInput.inputValue();
        expect(value.length).toBeGreaterThan(0);
      }
    }
  });

  test('should preview popup', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    const firstItem = page.locator('[data-testid="idea-card"]').first();
    if (await firstItem.count() > 0) {
      await firstItem.click();
      await page.click('text=Popup');
    }
    
    await page.waitForSelector('button:has-text("Preview")', { timeout: 5000 });
    
    // Click Preview
    const previewButton = page.locator('button:has-text("Preview")').first();
    if (await previewButton.count() > 0) {
      await previewButton.click();
      
      // Verify preview is shown
      await page.waitForSelector('text=Special Offer, .popup-preview, [data-testid="popup-preview"]', { timeout: 3000 });
    }
  });
});

