/**
 * Unit tests for CsvPreview component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CsvPreview } from './CsvPreview';

describe('CsvPreview', () => {
  it('should display empty state when data is empty', () => {
    render(<CsvPreview data={[]} />);
    expect(screen.getByText('CSV データがありません')).toBeInTheDocument();
  });

  it('should display empty state when data is null/undefined', () => {
    render(<CsvPreview data={null as any} />);
    expect(screen.getByText('CSV データがありません')).toBeInTheDocument();
  });

  it('should display column headers', () => {
    const data = [
      ['日付', 'カテゴリ', '金額'],
      ['2026-05-04', '食費', '1500'],
    ];
    render(<CsvPreview data={data} />);
    
    expect(screen.getByText('日付')).toBeInTheDocument();
    expect(screen.getByText('カテゴリ')).toBeInTheDocument();
    expect(screen.getByText('金額')).toBeInTheDocument();
  });

  it('should display CSV data rows', () => {
    const data = [
      ['日付', 'カテゴリ', '金額'],
      ['2026-05-04', '食費', '1500'],
      ['2026-05-05', '交通費', '500'],
    ];
    render(<CsvPreview data={data} />);
    
    expect(screen.getByText('2026-05-04')).toBeInTheDocument();
    expect(screen.getByText('食費')).toBeInTheDocument();
    expect(screen.getByText('1500')).toBeInTheDocument();
    expect(screen.getByText('2026-05-05')).toBeInTheDocument();
    expect(screen.getByText('交通費')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
  });

  it('should display total row count', () => {
    const data = [
      ['日付', 'カテゴリ', '金額'],
      ['2026-05-04', '食費', '1500'],
      ['2026-05-05', '交通費', '500'],
    ];
    render(<CsvPreview data={data} />);
    
    expect(screen.getByText('2 行のデータ')).toBeInTheDocument();
  });

  it('should limit display to maxRows (default 10)', () => {
    const data = [
      ['日付', 'カテゴリ', '金額'],
      ...Array.from({ length: 15 }, (_, i) => [
        `2026-05-${String(i + 1).padStart(2, '0')}`,
        '食費',
        '1500',
      ]),
    ];
    render(<CsvPreview data={data} />);
    
    // Should show "15 rows of data (showing first 10 rows)"
    expect(screen.getByText(/15 行のデータ/)).toBeInTheDocument();
    expect(screen.getByText(/最初の 10 行を表示/)).toBeInTheDocument();
    expect(screen.getByText('残り 5 行のデータがあります')).toBeInTheDocument();
  });

  it('should respect custom maxRows prop', () => {
    const data = [
      ['日付', 'カテゴリ', '金額'],
      ...Array.from({ length: 10 }, (_, i) => [
        `2026-05-${String(i + 1).padStart(2, '0')}`,
        '食費',
        '1500',
      ]),
    ];
    render(<CsvPreview data={data} maxRows={5} />);
    
    expect(screen.getByText(/10 行のデータ/)).toBeInTheDocument();
    expect(screen.getByText(/最初の 5 行を表示/)).toBeInTheDocument();
    expect(screen.getByText('残り 5 行のデータがあります')).toBeInTheDocument();
  });

  it('should handle empty cells with dash', () => {
    const data = [
      ['日付', 'カテゴリ', '金額'],
      ['2026-05-04', '', '1500'],
    ];
    render(<CsvPreview data={data} />);
    
    // Empty cell should display as "-"
    const cells = screen.getAllByText('-');
    expect(cells.length).toBeGreaterThan(0);
  });

  it('should handle rows with fewer columns than headers', () => {
    const data = [
      ['日付', 'カテゴリ', '金額', 'メモ'],
      ['2026-05-04', '食費'], // Missing last 2 columns
    ];
    render(<CsvPreview data={data} />);
    
    expect(screen.getByText('2026-05-04')).toBeInTheDocument();
    expect(screen.getByText('食費')).toBeInTheDocument();
    // Missing columns should be filled with "-"
    const dashes = screen.getAllByText('-');
    expect(dashes.length).toBeGreaterThanOrEqual(2);
  });

  it('should display default column names when headers are empty', () => {
    const data = [
      ['', '', ''],
      ['2026-05-04', '食費', '1500'],
    ];
    render(<CsvPreview data={data} />);
    
    expect(screen.getByText('列 1')).toBeInTheDocument();
    expect(screen.getByText('列 2')).toBeInTheDocument();
    expect(screen.getByText('列 3')).toBeInTheDocument();
  });

  it('should apply responsive design with horizontal scroll', () => {
    const data = [
      ['日付', 'カテゴリ', '金額'],
      ['2026-05-04', '食費', '1500'],
    ];
    const { container } = render(<CsvPreview data={data} />);
    
    // Check for overflow-x-auto class for horizontal scrolling
    const scrollContainer = container.querySelector('.overflow-x-auto');
    expect(scrollContainer).toBeInTheDocument();
  });

  it('should show hover effect on table rows', () => {
    const data = [
      ['日付', 'カテゴリ', '金額'],
      ['2026-05-04', '食費', '1500'],
    ];
    const { container } = render(<CsvPreview data={data} />);
    
    // Check for hover:bg-gray-50 class
    const row = container.querySelector('tbody tr');
    expect(row?.className).toContain('hover:bg-gray-50');
  });
});
