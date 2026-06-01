import { test, expect } from '@playwright/test';

test.describe('Navigation Flow', () => {
  // Login before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'Test123!@#Test');
    await Promise.all([
      page.waitForURL('/dashboard', { timeout: 10000 }),
      page.click('[data-testid="login-button"]'),
    ]);
  });

  test('should navigate between pages using top navigation', async ({ page }) => {
    // Start at dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible();
    
    // Navigate to transactions using data-testid
    await page.click('[data-testid="transactions-nav-link"]');
    await expect(page).toHaveURL('/transactions');
    
    // Navigate to CSV import
    await page.click('[data-testid="csv-import-nav-link"]');
    await expect(page).toHaveURL('/csv-import');
    
    // Navigate to categories
    await page.click('[data-testid="categories-nav-link"]');
    await expect(page).toHaveURL('/categories');
    
    // Navigate back to dashboard
    await page.click('[data-testid="dashboard-nav-link"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should navigate between pages using bottom navigation', async ({ page }) => {
    // Start at dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Navigate to transactions using bottom nav with data-testid
    // force: true はボトムナビが固定位置でビューポート外になる場合に対応
    await page.locator('[data-testid="transactions-bottom-nav-button"]').dispatchEvent('click');
    await expect(page).toHaveURL('/transactions');
    
    // Navigate to CSV import
    await page.locator('[data-testid="csv-import-bottom-nav-button"]').dispatchEvent('click');
    await expect(page).toHaveURL('/csv-import');
    
    // Navigate to categories
    await page.locator('[data-testid="categories-bottom-nav-button"]').dispatchEvent('click');
    await expect(page).toHaveURL('/categories');
    
    // Navigate back to dashboard
    await page.locator('[data-testid="dashboard-bottom-nav-button"]').dispatchEvent('click');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should highlight active page in navigation', async ({ page }) => {
    // Dashboard should be active - using data-testid
    await expect(page.locator('[data-testid="dashboard-nav-link"]')).toHaveClass(/bg-blue-50/);
    
    // Navigate to transactions
    await page.click('[data-testid="transactions-nav-link"]');
    
    // Transactions should be active
    await expect(page.locator('[data-testid="transactions-nav-link"]')).toHaveClass(/bg-blue-50/);
    
    // Dashboard should not be active
    await expect(page.locator('[data-testid="dashboard-nav-link"]')).not.toHaveClass(/bg-blue-50/);
  });

  test('should display user email in navigation', async ({ page }) => {
    // Using data-testid for more stable selector
    await expect(page.locator('[data-testid="user-email"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-email"]')).toContainText('test@example.com');
  });
});
