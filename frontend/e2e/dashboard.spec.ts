import { test, expect } from '@playwright/test';

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login using data-testid
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'Test123!@#Test');
    await Promise.all([
      page.waitForURL('/dashboard', { timeout: 10000 }),
      page.click('[data-testid="login-button"]'),
    ]);
  });

  test('should display dashboard with mock data', async ({ page }) => {
    // Check page title using data-testid
    await expect(page.locator('[data-testid="dashboard-title"]')).toContainText('ダッシュボード');
    
    // Check greeting using data-testid
    await expect(page.locator('[data-testid="user-greeting"]')).toContainText('test@example.com さん、こんにちは');
    
    // Check summary cards using data-testid
    await expect(page.locator('[data-testid="income-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="income-amount"]')).toContainText('¥300,000');
    
    await expect(page.locator('[data-testid="expense-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="expense-amount"]')).toContainText('¥28,000');
    
    await expect(page.locator('[data-testid="balance-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="balance-amount"]')).toContainText('+¥272,000');
  });

  test('should display category breakdown', async ({ page }) => {
    // Check category breakdown section using data-testid
    await expect(page.locator('[data-testid="category-breakdown"]')).toBeVisible();
    
    // Check specific categories using data-testid
    await expect(page.locator('[data-testid="category-item-給料"]')).toBeVisible();
    await expect(page.locator('[data-testid="category-item-光熱費"]')).toBeVisible();
    await expect(page.locator('[data-testid="category-item-娯楽"]')).toBeVisible();
    await expect(page.locator('[data-testid="category-item-食費"]')).toBeVisible();
    await expect(page.locator('[data-testid="category-item-交通費"]')).toBeVisible();
  });

  test('should display recent transactions', async ({ page }) => {
    // Check recent transactions section using data-testid
    await expect(page.locator('[data-testid="recent-transactions"]')).toBeVisible();
    
    // Check transaction items exist (IDs are dynamic, so we check the section exists)
    const transactionItems = page.locator('[data-testid^="transaction-item-"]');
    await expect(transactionItems.first()).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Dashboard should still be visible using data-testid
    await expect(page.locator('[data-testid="dashboard-title"]')).toContainText('ダッシュボード');
    
    // Summary cards should be visible
    await expect(page.locator('[data-testid="income-card"]')).toBeVisible();
    
    // Bottom navigation should be visible using data-testid
    await expect(page.locator('[data-testid="bottom-navigation"]')).toBeVisible();
    await expect(page.locator('[data-testid="dashboard-bottom-nav-button"]')).toBeVisible();
  });
});
