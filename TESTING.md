# SensAI End-to-End Testing Guide

## Overview

This document provides comprehensive instructions for running end-to-end tests for the SensAI application and generating professional test reports for your academic papers.

## Setup

The testing framework has been configured with the following stack:
- **Framework**: Playwright (Modern E2E testing)
- **Browsers**: Chromium, Firefox, WebKit
- **Devices**: Desktop (Chrome, Firefox, Safari) and Mobile (iOS, Android)
- **Reporting**: HTML + PDF Reports

## File Structure

```
sensai/
├── playwright.config.js          # Playwright configuration
├── tests/
│   └── e2e/
│       ├── auth.spec.js          # Authentication flow tests
│       ├── navigation.spec.js     # Navigation and routing tests
│       ├── api-and-performance.spec.js  # API and performance tests
│       └── ui-components.spec.js  # UI component tests
├── scripts/
│   └── generate-report.js         # Report generation script
├── test-results/                  # JSON test results
└── test-reports/                  # HTML & PDF reports
```

## Quick Start

### 1. Run All Tests
```bash
npm run test
```

### 2. Run Tests with UI Dashboard
```bash
npm run test:ui
```

### 3. Run Tests in Debug Mode
```bash
npm run test:debug
```

### 4. Run Tests in Headed Mode (See Browser)
```bash
npm run test:headed
```

### 5. Run Tests and Generate Reports
```bash
npm run test:report
```

## Test Coverage

The testing suite covers the following areas:

### Authentication Tests (`auth.spec.js`)
- ✓ Landing page loads correctly
- ✓ Sign-up page navigation
- ✓ Sign-in page navigation
- ✓ Header navigation functionality

### Navigation & Routing Tests (`navigation.spec.js`)
- ✓ Proper page structure and meta tags
- ✓ 404 error handling
- ✓ Theme provider functionality
- ✓ Component loading without errors
- ✓ Responsive design (Mobile & Desktop)

### API & Performance Tests (`api-and-performance.spec.js`)
- ✓ AI Interview API endpoint availability
- ✓ Jobs API endpoint availability
- ✓ Inngest webhook endpoint availability
- ✓ Homepage load performance (< 5 seconds)
- ✓ Resource loading and error checking

### UI Components Tests (`ui-components.spec.js`)
- ✓ UI component rendering
- ✓ Button functionality
- ✓ Link accessibility
- ✓ Form input accessibility
- ✓ Keyboard navigation support
- ✓ Heading hierarchy
- ✓ Error handling

## Reports

After running tests with `npm run test:report`, you'll get:

### 1. HTML Report
- **Location**: `test-reports/test-report.html`
- **View**: Open in any web browser
- **Features**: Detailed statistics, test results, pass/fail rates

### 2. PDF Report
- **Location**: `test-reports/test-report.pdf`
- **Use**: Perfect for academic papers and documentation
- **Contents**: Complete test summary, coverage areas, statistics

## Using Reports in Academic Papers

### For Your Papers:

1. **Download PDF Report**:
   ```bash
   npm run test:report
   ```
   Then download `test-reports/test-report.pdf`

2. **Cite in Your Paper**:
   ```
   SensAI End-to-End Test Report, Generated [DATE], 
   Available at: test-reports/test-report.pdf
   ```

3. **Include Statistics**:
   - Insert pass rate percentage
   - Include total number of tests run
   - Add coverage information

4. **Embed Screenshots** (from the HTML report):
   - Open `test-reports/test-report.html` in browser
   - Screenshot the statistics section
   - Insert into your paper

## Interpreting Results

### Pass Rate
- **90-100%**: Excellent - Production ready
- **70-89%**: Good - Fix critical failures
- **Below 70%**: Critical issues - Needs review

### Test Metrics
- **Total Tests**: Number of test cases executed
- **Passed**: Successful test executions
- **Failed**: Tests that found issues
- **Skipped**: Tests not executed

## Advanced Usage

### Run Specific Test File
```bash
npx playwright test tests/e2e/auth.spec.js
```

### Run Specific Test
```bash
npx playwright test -g "should load landing page"
```

### Run with Specific Browser
```bash
npx playwright test --project=chromium
```

### Run on Specific Device
```bash
npx playwright test --project="Mobile Chrome"
```

### Record New Tests
```bash
npx playwright codegen http://localhost:3000
```

## Troubleshooting

### Tests Fail with Connection Error
Ensure your development server is running:
```bash
npm run dev
```

### Playwright Browsers Not Installed
```bash
npx playwright install
```

### Port 3000 Already in Use
Change the port in `playwright.config.js` baseURL

### PDF Not Generating
Ensure these packages are installed:
```bash
npm install --save-dev jspdf puppeteer
```

## CI/CD Integration

To run tests in CI/CD pipeline (GitHub Actions, GitLab CI, etc.):

```bash
npm run test:report
```

This will exit with code 0 if tests pass, non-zero if any fail.

## Customization

### Add New Tests
Create a new file in `tests/e2e/` directory:
```javascript
import { test, expect } from '@playwright/test';

test.describe('My Feature', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/');
    // Your test here
  });
});
```

### Modify Configuration
Edit `playwright.config.js` to:
- Change test directory
- Add/remove browsers
- Adjust timeouts
- Modify reporters

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Test Configuration](https://playwright.dev/docs/test-configuration)

## Support

For issues or questions about the testing setup, refer to:
1. This README file
2. Playwright official documentation
3. Test output and error messages

---

**Last Updated**: 2026-04-08
**Test Framework**: Playwright
**Node Version**: 18+ recommended
