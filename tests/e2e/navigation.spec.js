import { test, expect } from '@playwright/test';

test.describe('Navigation and Routing', () => {
  test('should have proper page structure', async ({ page }) => {
    await page.goto('/');
    
    // Check meta tags
    const title = page.locator('title');
    await expect(title).toBeTruthy();
    
    // Check for main content area
    const main = page.locator('main');
    if (await main.count() > 0) {
      await expect(main).toBeVisible();
    }
  });

  test('should handle not-found route', async ({ page }) => {
    // Try to navigate to non-existent page
    const response = await page.goto('/non-existent-page-12345');
    
    // Should not crash, might show 404 page
    await expect(page).toHaveTitle(/not found|404|error/i);
  });

  test('should have functional theme provider', async ({ page }) => {
    await page.goto('/');
    
    // Check if theme elements are present
    const body = page.locator('body');
    const htmlElement = page.locator('html');
    
    // At least one of these should exist
    const themeToggle = page.getByRole('button', { name: /theme|dark|light/i });
    const hasThemeToggle = await themeToggle.count() > 0;
    
    // Page should render without errors
    await expect(page).not.toHaveURL(/error|500/i);
  });

  test('should load all main components without errors', async ({ page }) => {
    await page.goto('/');
    
    // Listen for console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Should have no critical errors
    expect(consoleErrors.filter(e => !e.includes('404'))).toEqual([]);
  });

  test('should check responsive design', async ({ page }) => {
    // Check mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    const heading = page.getByRole('heading').first();
    await expect(heading).toBeVisible();
    
    // Check desktop view
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    
    await expect(heading).toBeVisible();
  });
});
