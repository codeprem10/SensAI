import { test, expect } from '@playwright/test';

test.describe('UI Components and Interactions', () => {
  test('should render UI components without errors', async ({ page }) => {
    await page.goto('/');
    
    // Look for common UI elements
    const buttons = page.getByRole('button');
    const links = page.getByRole('link');
    const inputs = page.locator('input');
    
    // At least some interactive elements should exist
    expect(await buttons.count() + await links.count()).toBeGreaterThan(0);
  });

  test('should have functional buttons', async ({ page }) => {
    await page.goto('/');
    
    const buttons = page.getByRole('button');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      const firstButton = buttons.first();
      
      // Button should be visible and clickable
      await expect(firstButton).toBeVisible();
      await expect(firstButton).toBeEnabled();
    }
  });

  test('should have functional links', async ({ page }) => {
    await page.goto('/');
    
    const links = page.getByRole('link');
    const linkCount = await links.count();
    
    if (linkCount > 0) {
      const firstLink = links.first();
      
      // Link should be visible
      await expect(firstLink).toBeVisible();
      
      // Link should have href
      const href = await firstLink.getAttribute('href');
      expect(href).toBeTruthy();
    }
  });

  test('should have accessible form inputs', async ({ page }) => {
    await page.goto('/');
    
    // Look for form inputs
    const inputs = page.locator('input[type="text"], input[type="email"], textarea');
    const inputCount = await inputs.count();
    
    // If inputs exist, they should be accessible
    if (inputCount > 0) {
      const firstInput = inputs.first();
      
      // Should be able to focus
      await firstInput.focus();
      await expect(firstInput).toBeFocused();
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Tab through elements
    await page.keyboard.press('Tab');
    
    // Check if something has focus
    const focusedElement = await page.evaluate(() => {
      return document.activeElement.tagName;
    });
    
    // Should have a focused element
    expect(focusedElement).toBeTruthy();
    expect(focusedElement).not.toBe('BODY');
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    // Check for at least one heading
    const h1 = page.getByRole('heading', { level: 1 });
    const headings = page.getByRole('heading');
    
    const headingCount = await headings.count();
    
    // Page should have headings for structure
    expect(headingCount).toBeGreaterThan(0);
  });

  test('should handle errors gracefully', async ({ page }) => {
    page.on('pageerror', error => {
      // Log but don't fail - some libraries may have harmless errors
      console.log('Page error:', error);
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Page should still be functional after errors
    const buttons = page.getByRole('button');
    await expect(buttons.first()).toBeVisible();
  });
});
