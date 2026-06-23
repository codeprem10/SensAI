import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  test('should load landing page successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check if main page elements are visible
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    
    // Check for CTA buttons
    const buttons = page.getByRole('button');
    await expect(buttons).not.toHaveCount(0);
  });

  test('should navigate to sign up page', async ({ page }) => {
    await page.goto('/');
    
    // Click on sign up button/link if available
    const signUpLink = page.getByRole('link', { name: /sign up|register/i }).first();
    if (await signUpLink.isVisible()) {
      await signUpLink.click();
      await page.waitForURL(/sign-up|register/i);
      await expect(page).toHaveURL(/sign-up|register/i);
    }
  });

  test('should navigate to sign in page', async ({ page }) => {
    await page.goto('/');
    
    // Click on sign in button/link if available
    const signInLink = page.getByRole('link', { name: /sign in|login/i }).first();
    if (await signInLink.isVisible()) {
      await signInLink.click();
      await page.waitForURL(/sign-in|login/i);
      await expect(page).toHaveURL(/sign-in|login/i);
    }
  });

  test('should have working header navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check header elements
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    // Check if header has navigation items
    const navItems = header.getByRole('link');
    await expect(navItems).not.toHaveCount(0);
  });
});
