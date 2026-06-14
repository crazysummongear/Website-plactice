import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('CSV Import', () => {
  test('should upload and import CSV file', async ({ page }) => {
    await page.goto('http://localhost:5173/csv');
    
    // CSVファイルを準備
    const csvContent = `date,category,amount,incomeExpense,memo
2024-06-01,食費,5000,EXPENSE,Lunch
2024-06-02,給料,300000,INCOME,Monthly salary`;
    
    const csvPath = path.join(__dirname, '../test-data/test.csv');
    fs.mkdirSync(path.dirname(csvPath), { recursive: true });
    fs.writeFileSync(csvPath, csvContent);
    
    // ファイル選択
    await page.setInputFiles('[data-testid="csv-file-input"]', csvPath);
    
    // 確認
    const fileInput = page.locator('[data-testid="csv-file-input"]');
    expect(await fileInput.inputValue()).toContain('test.csv');
    
    // アップロード
    await page.click('[data-testid="csv-upload-button"]');
    
    // プログレスバー表示確認
    await expect(page.locator('[data-testid="csv-progress-bar"]')).toBeVisible();
    
    // 成功メッセージ確認
    const message = page.locator('[data-testid="csv-message"]');
    await expect(message).toContainText('アップロード', { timeout: 5000 });
    
    // クリーンアップ
    fs.unlinkSync(csvPath);
  });

  test('should show error for invalid file size', async ({ page }) => {
    await page.goto('http://localhost:5173/csv');
    
    // 大きなファイルをシミュレート（実装がファイルサイズをチェックする場合）
    const largeCsvContent = 'a'.repeat(11 * 1024 * 1024); // 11MB
    const csvPath = path.join(__dirname, '../test-data/large.csv');
    fs.mkdirSync(path.dirname(csvPath), { recursive: true });
    fs.writeFileSync(csvPath, largeCsvContent);
    
    await page.setInputFiles('[data-testid="csv-file-input"]', csvPath);
    
    // エラーメッセージ表示確認
    const message = page.locator('[data-testid="csv-message"]');
    await expect(message).toContainText('サイズ');
    
    fs.unlinkSync(csvPath);
  });
});
