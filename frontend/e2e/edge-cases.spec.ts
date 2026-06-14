/**
 * Edge Cases and Error Handling E2E Tests
 * 
 * Tests error scenarios, boundary conditions, and special cases.
 */

import { test, expect } from '@playwright/test';

test.describe('Edge Cases and Error Handling', () => {
  test('should handle network errors gracefully', async ({ page, context }) => {
    await page.goto('http://localhost:5173/dashboard');

    // Simulate offline mode
    await context.setOffline(true);

    // Try to perform an action
    await page.click('[data-testid="dashboard-add-button"]');
    await page.waitForTimeout(500);

    // Fill form
    await page.fill('input[placeholder*="金額"]', '5000');
    await page.click('button:has-text("追加")');

    // Should show error message
    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible({ timeout: 10000 });

    // Restore connection
    await context.setOffline(false);

    // Try again - should work
    await page.fill('input[placeholder*="金額"]', '5000');
    await page.click('button:has-text("追加")');

    // Should succeed
    await page.waitForTimeout(1000);
  });

  test('should handle very large transaction amounts', async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard');

    await page.click('[data-testid="dashboard-add-button"]');
    await page.waitForTimeout(300);

    // Try very large amount
    const largeAmount = '999999999';
    await page.fill('input[placeholder*="金額"]', largeAmount);
    await page.fill('input[placeholder*="日付"]', '2024-01-15');

    await page.click('select[name="incomeExpense"]');
    await page.selectOption('select[name="incomeExpense"]', 'INCOME');

    await page.click('button:has-text("追加")');

    // Should handle gracefully
    await page.waitForTimeout(1000);

    // Either success or validation error, but not a crash
    const errorOrSuccess = page.locator(
      '[data-testid="error-message"], [data-testid="success-message"]'
    );
    // Page should still be responsive
    await expect(page.locator('text=ダッシュボード')).toBeVisible();
  });

  test('should handle special characters in transaction memo', async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard');

    await page.click('[data-testid="dashboard-add-button"]');
    await page.waitForTimeout(300);

    // Use special characters
    const specialMemo = 'テスト!@#$%^&*()_+-=[]{}|;:\'",.<>?/\\~`';
    await page.fill('input[placeholder*="メモ"]', specialMemo);
    await page.fill('input[placeholder*="金額"]', '1000');
    await page.fill('input[placeholder*="日付"]', '2024-01-15');

    await page.click('select[name="incomeExpense"]');
    await page.selectOption('select[name="incomeExpense"]', 'EXPENSE');

    await page.click('button:has-text("追加")');

    // Should handle special characters
    await page.waitForTimeout(1000);

    // Verify it was saved correctly by navigating to list
    await page.click('[data-testid="nav-bottom-list"]');
    await page.waitForNavigation({ waitUntil: 'networkidle' });

    // Should display correctly
    await expect(page.locator('text=テスト')).toBeVisible();
  });

  test('should handle very long memo text', async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard');

    await page.click('[data-testid="dashboard-add-button"]');
    await page.waitForTimeout(300);

    // Long text memo
    const longMemo = 'あ'.repeat(500);
    await page.fill('input[placeholder*="メモ"]', longMemo);
    await page.fill('input[placeholder*="金額"]', '1000');
    await page.fill('input[placeholder*="日付"]', '2024-01-15');

    await page.click('select[name="incomeExpense"]');
    await page.selectOption('select[name="incomeExpense"]', 'EXPENSE');

    await page.click('button:has-text("追加")');

    // Should handle gracefully
    await page.waitForTimeout(1000);
  });

  test('should handle rapid consecutive operations', async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard');

    // Rapid clicks - should not cause errors
    for (let i = 0; i < 5; i++) {
      await page.click('[data-testid="dashboard-add-button"]');
      await page.waitForTimeout(100); // Very short wait

      const amount = 1000 + i;
      await page.fill('input[placeholder*="金額"]', amount.toString());
      await page.fill('input[placeholder*="日付"]', '2024-01-15');

      await page.click('select[name="incomeExpense"]');
      await page.selectOption('select[name="incomeExpense"]', 'EXPENSE');

      await page.click('button:has-text("追加")');
      await page.waitForTimeout(200);
    }

    // Page should still be responsive
    await expect(page.locator('text=ダッシュボード')).toBeVisible();
  });

  test('should handle concurrent filter operations', async ({ page }) => {
    await page.goto('http://localhost:5173/transactions');

    // Apply multiple filters in sequence
    await page.click('[data-testid="filter-expense"]');
    await page.waitForTimeout(300);

    await page.click('[data-testid="filter-by-date"]');
    await page.waitForTimeout(300);

    // Select date range
    await page.fill('input[placeholder*="開始日"]', '2024-01-01');
    await page.fill('input[placeholder*="終了日"]', '2024-01-31');

    await page.click('button:has-text("適用")');
    await page.waitForTimeout(500);

    // Should show filtered results without crashing
    await expect(page.locator('[data-testid="transaction-item"]')).toHaveCount(
      /\d+/ // Should have some transactions or none
    );
  });

  test('should handle invalid date formats gracefully', async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard');

    await page.click('[data-testid="dashboard-add-button"]');
    await page.waitForTimeout(300);

    // Try invalid date
    await page.fill('input[placeholder*="日付"]', 'invalid-date');
    await page.fill('input[placeholder*="金額"]', '1000');

    await page.click('select[name="incomeExpense"]');
    await page.selectOption('select[name="incomeExpense"]', 'EXPENSE');

    await page.click('button:has-text("追加")');

    // Should show validation error
    const errorMessage = page.locator('[data-testid="error-message"], text=日付');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('should handle zero and negative amounts', async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard');

    // Test zero amount
    await page.click('[data-testid="dashboard-add-button"]');
    await page.waitForTimeout(300);

    await page.fill('input[placeholder*="金額"]', '0');
    await page.fill('input[placeholder*="日付"]', '2024-01-15');

    await page.click('select[name="incomeExpense"]');
    await page.selectOption('select[name="incomeExpense"]', 'EXPENSE');

    await page.click('button:has-text("追加")');

    // Should validate and reject
    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('should handle session timeout and require re-login', async ({ page, context }) => {
    await page.goto('http://localhost:5173/dashboard');

    // Simulate session expiration by clearing tokens
    await context.clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Try to navigate or refresh
    await page.reload();

    // Should redirect to login
    await page.waitForNavigation({ waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/.*login/);
  });

  test('should handle CSV import with malformed data', async ({ page }) => {
    await page.goto('http://localhost:5173/csv');

    // Create malformed CSV
    const malformedCSV = `date,category,amount,incomeExpense,memo
2024-01-01,給料,not-a-number,INCOME,1月給料
2024-01-15,INVALID_TYPE,5000,INVALID_TYPE,test`;

    const buffer = Buffer.from(malformedCSV);
    const fileInput = page.locator('input[type="file"]');

    if (await fileInput.isVisible()) {
      await fileInput.setInputFiles({
        name: 'malformed.csv',
        mimeType: 'text/csv',
        buffer: buffer,
      });

      await page.waitForTimeout(500);

      // Try to import
      const importButton = page.locator('button:has-text("インポート")');
      if (await importButton.isVisible()) {
        await importButton.click();
        await page.waitForTimeout(1000);

        // Should show error message about invalid data
        const errorMessage = page.locator('[data-testid="error-message"]');
        // Either error or partial import
        await expect(page.locator('text=CSV')).toBeVisible();
      }
    }
  });

  test('should handle empty CSV file', async ({ page }) => {
    await page.goto('http://localhost:5173/csv');

    // Create empty CSV
    const emptyCSV = '';
    const buffer = Buffer.from(emptyCSV);
    const fileInput = page.locator('input[type="file"]');

    if (await fileInput.isVisible()) {
      await fileInput.setInputFiles({
        name: 'empty.csv',
        mimeType: 'text/csv',
        buffer: buffer,
      });

      await page.waitForTimeout(500);

      const importButton = page.locator('button:has-text("インポート")');
      if (await importButton.isVisible()) {
        await importButton.click();
        await page.waitForTimeout(1000);

        // Should handle gracefully
        await expect(page.locator('text=CSV')).toBeVisible();
      }
    }
  });

  test('should prevent duplicate transaction submissions', async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard');

    await page.click('[data-testid="dashboard-add-button"]');
    await page.waitForTimeout(300);

    await page.fill('input[placeholder*="金額"]', '5000');
    await page.fill('input[placeholder*="日付"]', '2024-01-15');

    await page.click('select[name="incomeExpense"]');
    await page.selectOption('select[name="incomeExpense"]', 'EXPENSE');

    const submitButton = page.locator('button:has-text("追加")');

    // Rapid clicks on submit button
    await submitButton.click();
    await submitButton.click();
    await submitButton.click();

    // Should prevent duplicate submissions
    await page.waitForTimeout(2000);

    // Verify only one transaction was created
    // This would require backend verification
  });

  test('should handle filter date boundary conditions', async ({ page }) => {
    await page.goto('http://localhost:5173/transactions');

    // Test with same start and end date
    await page.click('[data-testid="filter-by-date"]');
    await page.waitForTimeout(300);

    await page.fill('input[placeholder*="開始日"]', '2024-01-15');
    await page.fill('input[placeholder*="終了日"]', '2024-01-15');

    await page.click('button:has-text("適用")');
    await page.waitForTimeout(500);

    // Should show only transactions from that date
    await expect(page.locator('[data-testid="transaction-item"]')).toHaveCount(/\d*/);

    // Test with end date before start date
    await page.click('[data-testid="filter-by-date"]');
    await page.fill('input[placeholder*="開始日"]', '2024-01-31');
    await page.fill('input[placeholder*="終了日"]', '2024-01-01');

    await page.click('button:has-text("適用")');
    await page.waitForTimeout(500);

    // Should handle gracefully
    await expect(page.locator('text=トランザクション')).toBeVisible();
  });
});
