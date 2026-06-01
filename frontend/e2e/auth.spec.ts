import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:5173/login');
    
    // Verify we're on the login page
    await expect(page.locator('h1')).toContainText('kakei');
    
    // Fill in login form using data-testid
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'Test123!@#Test');
    
    // Submit form
    await page.click('[data-testid="login-button"]');
    
    // Wait for dashboard title to appear (this indicates successful login and redirect)
    await page.waitForSelector('[data-testid="dashboard-title"]', { timeout: 15000 });
    
    // Verify we're on the dashboard using data-testid
    await expect(page.locator('[data-testid="dashboard-title"]')).toContainText('ダッシュボード');
    await expect(page.locator('[data-testid="user-greeting"]')).toContainText('test@example.com');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // ローディング完了を待つ（ボタンが有効になるまで）
    await expect(page.locator('[data-testid="login-button"]')).toBeEnabled({ timeout: 5000 });
    
    // Fill in with invalid password (less than 12 characters) using data-testid
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'short');
    
    // Submit the form to trigger validation
    await page.click('[data-testid="login-button"]');
    
    // Should show validation error using data-testid
    await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-error"]')).toContainText('パスワードは12文字以上');
    
    // Should still be on login page
    await expect(page).toHaveURL('/login');
  });

  test('should logout successfully', async ({ page }) => {
    // Login first using data-testid
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'Test123!@#Test');
    
    await Promise.all([
      page.waitForURL('/dashboard', { timeout: 10000 }),
      page.click('[data-testid="login-button"]'),
    ]);
    
    // Click logout button and wait for navigation using data-testid
    await Promise.all([
      page.waitForURL('/login', { timeout: 10000 }),
      page.click('[data-testid="logout-button"]'),
    ]);
    
    // Should be back on login page
    await expect(page.locator('h1')).toContainText('kakei');
  });

  test('should redirect to login when accessing protected route without auth', async ({ page }) => {
    // Try to access dashboard directly
    await page.goto('/dashboard');
    
    // Should redirect to login
    await page.waitForURL('/login', { timeout: 10000 });
    await expect(page.locator('h1')).toContainText('kakei');
  });
});
