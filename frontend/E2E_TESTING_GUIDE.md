# E2E Testing Guide

## Overview

This project uses [Playwright](https://playwright.dev/) for end-to-end testing. Playwright allows us to test the application in real browsers (Chromium, Firefox, WebKit) and mobile viewports.

## Setup

Playwright is already installed. To install browsers:

```bash
npx playwright install
```

## Running Tests

### Run all E2E tests
```bash
npm run test:e2e
```

### Run tests in UI mode (interactive)
```bash
npm run test:e2e:ui
```

### Run tests in debug mode
```bash
npm run test:e2e:debug
```

### Run tests for specific browser
```bash
npm run test:e2e -- --project=chromium
npm run test:e2e -- --project=firefox
npm run test:e2e -- --project=webkit
```

### Run specific test file
```bash
npm run test:e2e -- e2e/auth.spec.ts
```

## Test Structure

Tests are located in the `e2e/` directory:

- `auth.spec.ts` - Authentication flow tests (login, logout, signup)
- `navigation.spec.ts` - Navigation tests (top nav, bottom nav, active states)
- `dashboard.spec.ts` - Dashboard page tests (data display, responsive)

## Mock Mode

E2E tests run with `VITE_MOCK_AUTH=true` to use mock authentication instead of real Cognito. This is configured in `playwright.config.ts`.

## Configuration

Playwright configuration is in `playwright.config.ts`:

- **Test directory**: `./e2e`
- **Base URL**: `http://localhost:5173` (auto-starts dev server)
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Retries**: 2 on CI, 0 locally
- **Screenshots**: On failure only
- **Videos**: On failure only
- **Traces**: On first retry

## Writing Tests

Example test structure:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Test implementation
    await page.click('button');
    await expect(page.locator('h1')).toContainText('Expected Text');
  });
});
```

## Best Practices

1. **Use data-testid attributes** for stable selectors
2. **Wait for navigation** with `page.waitForURL()`
3. **Use explicit waits** with `expect().toBeVisible()`
4. **Test user flows** not implementation details
5. **Keep tests independent** - each test should work in isolation
6. **Use beforeEach** for common setup
7. **Clean up after tests** if needed

## Debugging

### View test report
```bash
npx playwright show-report
```

### Run with headed browser (see what's happening)
```bash
npm run test:e2e -- --headed
```

### Pause test execution
```typescript
await page.pause();
```

### Take screenshot
```typescript
await page.screenshot({ path: 'screenshot.png' });
```

## CI/CD Integration

On CI, tests will:
- Run with 2 retries
- Use single worker (no parallel execution)
- Generate HTML report
- Capture screenshots and videos on failure

## Troubleshooting

### Tests timing out
- Check if dev server is starting correctly
- Increase timeout in test: `test.setTimeout(60000)`
- Check network requests in browser DevTools

### Element not found
- Use `page.waitForSelector()` before interacting
- Check if element is visible: `await expect(locator).toBeVisible()`
- Use more specific selectors

### Flaky tests
- Add explicit waits
- Use `waitForLoadState('networkidle')`
- Avoid time-based waits (`page.waitForTimeout()`)

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
