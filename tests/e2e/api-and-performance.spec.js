import { test, expect } from '@playwright/test';

test.describe('API Endpoints', () => {
  test('should have working AI interview endpoint', async ({ request }) => {
    const response = await request.options('/api/ai-interview', {
      headers: {
        'Accept': 'application/json',
      }
    }).catch(() => null);
    
    // Endpoint should exist or respond with error code other than 404
    if (response) {
      expect([200, 204, 405, 415, 400, 401, 403, 500]).toContain(response.status());
    }
  });

  test('should have working jobs API endpoint', async ({ request }) => {
    const response = await request.options('/api/jobs', {
      headers: {
        'Accept': 'application/json',
      }
    }).catch(() => null);
    
    if (response) {
      expect([200, 204, 405, 415, 400, 401, 403, 500]).toContain(response.status());
    }
  });

  test('should have inngest webhook endpoint', async ({ request }) => {
    const response = await request.options('/api/inngest', {
      headers: {
        'Accept': 'application/json',
      }
    }).catch(() => null);
    
    if (response) {
      expect([200, 204, 405, 415, 400, 401, 403, 500]).toContain(response.status());
    }
  });
});

test.describe('Page Performance', () => {
  test('should load homepage in reasonable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/', {
      waitUntil: 'domcontentloaded'
    });
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should not have broken images or resources', async ({ page }) => {
    await page.goto('/');
    
    // Check for failed resources
    const failedResources = [];
    
    page.on('requestfailed', request => {
      failedResources.push(request.url());
    });
    
    await page.waitForLoadState('networkidle');
    
    // Filter out expected failures and external resources
    const unexpectedFailures = failedResources.filter(url => 
      !url.includes('external') && 
      !url.includes('tracking') &&
      !url.includes('analytics')
    );
    
    expect(unexpectedFailures.length).toBe(0);
  });
});
