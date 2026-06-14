import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should complete signup and login flow', async ({ page }) => {
    // ページアクセス
    await page.goto('http://localhost:5173/signup');
    
    // サインアップ
    await page.fill('data-testid=signup-email-input', 'test@example.com');
    await page.fill('data-testid=signup-password-input', 'Test@12345');
    await page.fill('data-testid=signup-confirm-password-input', 'Test@12345');
    await page.click('data-testid=signup-submit-button');
    
    // 確認コード入力を待つ
    await page.waitForSelector('[data-testid="signup-code-input"]', { timeout: 5000 });
    // Mock の確認コード (例: 123456)
    await page.fill('data-testid=signup-code-input', '123456');
    
    // ログイン
    await page.goto('http://localhost:5173/login');
    await page.fill('data-testid=login-email-input', 'test@example.com');
    await page.fill('data-testid=login-password-input', 'Test@12345');
    await page.click('data-testid=login-submit-button');
    
    // ダッシュボードへリダイレクト確認
    await page.waitForNavigation();
    expect(page.url()).toContain('/dashboard');
  });

  test('should display login error on invalid credentials', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    
    await page.fill('data-testid=login-email-input', 'wrong@example.com');
    await page.fill('data-testid=login-password-input', 'wrong');
    await page.click('data-testid=login-submit-button');
    
    // エラーメッセージ表示確認
    const errorMessage = page.locator('[data-testid="login-error-message"]');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });
});
