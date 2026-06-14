import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // ログイン状態にする
    await page.goto('http://localhost:5173/login');
    // ローカルストレージにトークン設定 (Mock用)
    await page.evaluate(() => {
      localStorage.setItem('kakei_id_token', 'mock-token');
    });
    await page.goto('http://localhost:5173/dashboard');
  });

  test('should display dashboard summary', async ({ page }) => {
    await expect(page.locator('[data-testid="dashboard-summary-income"]')).toBeVisible();
    await expect(page.locator('[data-testid="dashboard-summary-expense"]')).toBeVisible();
    await expect(page.locator('[data-testid="dashboard-summary-balance"]')).toBeVisible();
  });

  test('should display transactions list', async ({ page }) => {
    await expect(page.locator('[data-testid="dashboard-transactions-list"]')).toBeVisible();
  });

  test('should add new transaction', async ({ page }) => {
    await page.click('[data-testid="dashboard-add-button"]');
    
    // フォーム表示確認
    await expect(page.locator('[data-testid="transaction-form"]')).toBeVisible();
    
    // 入力
    await page.fill('[data-testid="transaction-date-input"]', '2024-06-01');
    await page.selectOption('[data-testid="transaction-category-select"]', 'food');
    await page.fill('[data-testid="transaction-amount-input"]', '5000');
    await page.click('[data-testid="transaction-expense-radio"]');
    await page.fill('[data-testid="transaction-memo-input"]', 'Lunch');
    
    // 送信
    await page.click('[data-testid="transaction-submit-button"]');
    
    // リスト更新確認
    await page.waitForTimeout(1000);
    const items = page.locator('[data-testid="transaction-item"]');
    expect(await items.count()).toBeGreaterThan(0);
  });

  test('should edit transaction', async ({ page }) => {
    // トランザクションの編集ボタンをクリック
    await page.click('[data-testid="transaction-edit-btn-0"]');
    
    // 金額変更
    await page.fill('[data-testid="transaction-amount-input"]', '10000');
    await page.click('[data-testid="transaction-submit-button"]');
    
    // 確認
    await page.waitForTimeout(1000);
    const updatedAmount = page.locator('[data-testid="transaction-amount-0"]');
    await expect(updatedAmount).toContainText('10000');
  });

  test('should delete transaction', async ({ page }) => {
    const countBefore = await page.locator('[data-testid="transaction-item"]').count();
    
    // 削除ボタン
    await page.click('[data-testid="transaction-delete-btn-0"]');
    
    // 確認ダイアログで OK
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    // リスト更新確認
    await page.waitForTimeout(1000);
    const countAfter = await page.locator('[data-testid="transaction-item"]').count();
    expect(countAfter).toBe(countBefore - 1);
  });
});
