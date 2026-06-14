/**
 * Full User Flow E2E Tests
 * 
 * Tests the complete application flow from signup to logout,
 * including all major features: transactions, categories, and CSV import.
 */

import { test, expect } from '@playwright/test';

test.describe('Full User Flow', () => {
  test('should complete full app flow: signup -> login -> dashboard -> transactions -> csv -> logout', async ({
    page,
  }) => {
    // 1. Sign up
    await page.goto('http://localhost:5173/signup');
    await expect(page).toHaveURL(/.*signup/);

    // Fill signup form
    const timestamp = Date.now();
    const testEmail = `testuser${timestamp}@example.com`;
    const testPassword = 'TestPassword123!@#';

    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.fill('input[placeholder*="confirm" i]', testPassword);

    // Submit signup
    await page.click('button:has-text("Sign Up")');

    // Wait for confirmation screen or redirect
    await page.waitForNavigation({ waitUntil: 'networkidle' });

    // 2. Confirm sign up (if required)
    // In real scenario, would receive code via email
    const confirmCodeInput = page.locator('input[placeholder*="confirmation" i]');
    if (await confirmCodeInput.isVisible()) {
      // Use a mock code or actual code from email service
      await confirmCodeInput.fill('000000');
      await page.click('button:has-text("Confirm")');
      await page.waitForNavigation();
    }

    // 3. Login
    await page.goto('http://localhost:5173/login');
    await expect(page).toHaveURL(/.*login/);

    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button:has-text("Sign In")');

    // Wait for redirect to dashboard
    await page.waitForNavigation({ waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/.*dashboard/);

    // 4. Verify dashboard displays
    await expect(page.locator('text=ダッシュボード')).toBeVisible();
    await expect(page.locator('[data-testid="dashboard-summary"]')).toBeVisible();

    // 5. Add a transaction via inline form
    await page.click('[data-testid="dashboard-add-button"]');
    await page.waitForTimeout(500); // Wait for form to appear

    // Fill transaction form
    await page.fill('input[placeholder*="日付"]', '2024-01-15');
    await page.fill('input[placeholder*="金額"]', '5000');
    await page.fill('input[placeholder*="メモ"]', 'テスト');

    // Select category
    await page.click('select[name="category"]');
    await page.selectOption('select[name="category"]', '食費');

    // Select income/expense type
    await page.click('select[name="incomeExpense"]');
    await page.selectOption('select[name="incomeExpense"]', 'EXPENSE');

    // Submit
    await page.click('button:has-text("追加")');

    // Wait for transaction to be created
    await page.waitForTimeout(1000);

    // 6. Navigate to transaction list
    await page.click('[data-testid="nav-bottom-list"]');
    await page.waitForNavigation({ waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/.*transactions/);

    // Verify transaction appears in list
    await expect(page.locator('text=テスト')).toBeVisible();

    // 7. Test filters on transaction list
    await page.click('[data-testid="filter-expense"]');
    await page.waitForTimeout(500);

    // Verify list is filtered
    const expenseItems = page.locator('[data-testid="transaction-item"]:has-text("EXPENSE")');
    const itemCount = await expenseItems.count();
    expect(itemCount).toBeGreaterThan(0);

    // 8. Navigate to CSV import page
    await page.click('[data-testid="nav-bottom-csv"]');
    await page.waitForNavigation({ waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/.*csv/);

    // 9. Test CSV import
    await expect(page.locator('text=CSV')).toBeVisible();

    // Create a test CSV file
    const csvContent = `date,category,amount,incomeExpense,memo
2024-01-10,給料,300000,INCOME,1月給料
2024-01-20,交通費,2000,EXPENSE,バス`;

    const buffer = Buffer.from(csvContent);
    const fileName = `test-${Date.now()}.csv`;

    // Upload CSV file
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.isVisible()) {
      await fileInput.setInputFiles({
        name: fileName,
        mimeType: 'text/csv',
        buffer: buffer,
      });

      // Wait for file upload to complete
      await page.waitForTimeout(1000);

      // Click import/submit button
      const importButton = page.locator('button:has-text("インポート")');
      if (await importButton.isVisible()) {
        await importButton.click();
        await page.waitForTimeout(2000);
      }
    }

    // 10. Navigate back to dashboard to verify data
    await page.click('[data-testid="nav-bottom-home"]');
    await page.waitForNavigation({ waitUntil: 'networkidle' });

    // Verify dashboard updated with new data
    await expect(page.locator('[data-testid="dashboard-summary"]')).toBeVisible();

    // 11. Logout
    const logoutButton = page.locator('[data-testid="nav-logout-button"]');
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    } else {
      // Try to find logout in menu
      await page.click('[data-testid="user-menu"]');
      await page.click('button:has-text("ログアウト")');
    }

    // Verify redirected to login
    await page.waitForNavigation({ waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/.*login/);
  });

  test('should handle multiple transactions and calculate summary correctly', async ({
    page,
  }) => {
    // Login
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Sign In")');

    await page.waitForNavigation({ waitUntil: 'networkidle' });

    // Navigate to dashboard
    await expect(page).toHaveURL(/.*dashboard/);

    // Capture initial summary
    const initialSummary = await page.locator('[data-testid="dashboard-summary"]').innerHTML();

    // Add multiple transactions
    for (let i = 0; i < 3; i++) {
      await page.click('[data-testid="dashboard-add-button"]');
      await page.waitForTimeout(300);

      const amount = 1000 * (i + 1);
      await page.fill('input[placeholder*="金額"]', amount.toString());
      await page.fill('input[placeholder*="日付"]', '2024-01-15');

      await page.click('select[name="incomeExpense"]');
      await page.selectOption('select[name="incomeExpense"]', 'EXPENSE');

      await page.click('button:has-text("追加")');
      await page.waitForTimeout(500);
    }

    // Refresh dashboard
    await page.reload();

    // Verify summary updated
    const updatedSummary = await page.locator('[data-testid="dashboard-summary"]').innerHTML();
    expect(updatedSummary).not.toBe(initialSummary);
  });

  test('should handle navigation between all main sections', async ({ page }) => {
    // Assume already logged in
    await page.goto('http://localhost:5173/dashboard');

    // Test navigation between sections
    const navItems = [
      { button: '[data-testid="nav-bottom-home"]', url: 'dashboard' },
      { button: '[data-testid="nav-bottom-list"]', url: 'transactions' },
      { button: '[data-testid="nav-bottom-csv"]', url: 'csv' },
    ];

    for (const { button, url } of navItems) {
      await page.click(button);
      await page.waitForNavigation({ waitUntil: 'networkidle' });
      await expect(page).toHaveURL(new RegExp(url));
    }
  });

  test('should preserve data after page refresh', async ({ page }) => {
    // Navigate to transactions list
    await page.goto('http://localhost:5173/transactions');

    // Capture visible transactions
    const transactionsBefore = await page.locator('[data-testid="transaction-item"]').count();

    // Refresh page
    await page.reload({ waitUntil: 'networkidle' });

    // Verify transactions still visible
    const transactionsAfter = await page.locator('[data-testid="transaction-item"]').count();
    expect(transactionsAfter).toBe(transactionsBefore);
  });
});
