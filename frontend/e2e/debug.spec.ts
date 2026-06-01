import { test, expect } from '@playwright/test';

test.describe('Debug Tests', () => {
  test('should load login page and check mock mode', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/debug-login-page.png', fullPage: true });
    
    // Check if login form is visible
    await expect(page.locator('h1')).toContainText('kakei');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Fill in the form
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'Test123!@#Test');
    
    // Take screenshot before submit
    await page.screenshot({ path: 'test-results/debug-before-submit.png', fullPage: true });
    
    // Check if submit button is enabled
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled();
    
    // Click submit
    await submitButton.click();
    
    // Wait a bit
    await page.waitForTimeout(2000);
    
    // Take screenshot after submit
    await page.screenshot({ path: 'test-results/debug-after-submit.png', fullPage: true });
    
    // Check current URL
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    // Check for any error messages
    const errorMessage = await page.locator('text=/エラー|error|failed/i').count();
    console.log('Error messages found:', errorMessage);
    
    // Log page content
    const pageContent = await page.content();
    console.log('Page HTML length:', pageContent.length);
  });
});
