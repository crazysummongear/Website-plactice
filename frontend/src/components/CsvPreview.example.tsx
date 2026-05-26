/**
 * Example usage of CsvPreview component
 * This file demonstrates how to use the CsvPreview component
 */

import { CsvPreview } from './CsvPreview';

/**
 * Example 1: Basic usage with sample CSV data
 */
export function BasicExample() {
  const csvData = [
    ['日付', 'カテゴリ', '金額', '収入/支出', 'メモ'],
    ['2026-05-04', '食費', '1500', 'EXPENSE', 'スーパーで買い物'],
    ['2026-05-05', '交通費', '500', 'EXPENSE', '電車代'],
    ['2026-05-06', '給料', '300000', 'INCOME', '月給'],
  ];

  return <CsvPreview data={csvData} />;
}

/**
 * Example 2: With custom maxRows
 */
export function CustomMaxRowsExample() {
  const csvData = [
    ['日付', 'カテゴリ', '金額'],
    ...Array.from({ length: 20 }, (_, i) => [
      `2026-05-${String(i + 1).padStart(2, '0')}`,
      '食費',
      '1500',
    ]),
  ];

  return <CsvPreview data={csvData} maxRows={5} />;
}

/**
 * Example 3: Empty data handling
 */
export function EmptyDataExample() {
  return <CsvPreview data={[]} />;
}

/**
 * Example 4: Integration with file upload
 */
export function FileUploadExample() {
  const [csvData, setCsvData] = useState<string[][]>([]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const rows = text.split('\n').map(row => row.split(','));
    setCsvData(rows);
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500"
      />
      <CsvPreview data={csvData} />
    </div>
  );
}

/**
 * Example 5: With Papa Parse library (recommended for production)
 */
export function PapaParseExample() {
  const [csvData, setCsvData] = useState<string[][]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Using Papa Parse (install with: npm install papaparse)
    // import Papa from 'papaparse';
    // 
    // Papa.parse(file, {
    //   complete: (results) => {
    //     setCsvData(results.data as string[][]);
    //   },
    //   error: (error) => {
    //     console.error('CSV parse error:', error);
    //   },
    // });
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500"
      />
      <CsvPreview data={csvData} maxRows={10} />
    </div>
  );
}

// Note: Add this import at the top if using the FileUploadExample
import { useState } from 'react';
