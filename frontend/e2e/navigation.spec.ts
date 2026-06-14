import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate through pages', async ({ page }) => {
    // ダッシュボード
    await page.goto('http://localhost:5173/dashboard');
    await expect(page.locator('[data-testid="nav-bottom-dashboard"]')).toBeVisible();
    
    // 一覧ページ
    await page.click('[data-testid="nav-bottom-list"]');
    await page.waitForNavigation();
    expect(page.url()).toContain('/transactions');
    
    // CSV インポート
    await page.click('[data-testid="nav-bottom-csv"]');
    await page.waitForNavigation();
    expect(page.url()).toContain('/csv');
    
    // カテゴリ
    await page.click('[data-testid="nav-bottom-category"]');
    await page.waitForNavigation();
    expect(page.url()).toContain('/category');
  });

  test('should display user email in header', async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard');
    
    const userEmail = page.locator('[data-testid="nav-user-email"]');
    await expect(userEmail).toBeVisible();
  });

  test('should logout', async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard');
    
    await page.click('[data-testid="nav-logout-button"]');
    
    // ログインページへリダイレクト
    await page.waitForNavigation();
    expect(page.url()).toContain('/login');
  });
});
