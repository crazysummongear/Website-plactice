/**
 * Column Mapper Component
 * Maps CSV columns to transaction fields
 */

import React from 'react';

export interface ColumnMapping {
  csvColumn: string;
  transactionField: 'date' | 'amount' | 'category' | 'memo' | 'type' | 'skip';
}

export interface ColumnMapperProps {
  csvHeaders: string[];
  mappings: ColumnMapping[];
  onMappingChange: (index: number, field: ColumnMapping['transactionField']) => void;
}

const TRANSACTION_FIELDS = [
  { value: 'date', label: '日付 (Date)' },
  { value: 'amount', label: '金額 (Amount)' },
  { value: 'category', label: 'カテゴリ (Category)' },
  { value: 'memo', label: 'メモ (Memo)' },
  { value: 'type', label: '種別 (Type: income/expense)' },
  { value: 'skip', label: 'スキップ (Skip)' },
] as const;

export const ColumnMapper: React.FC<ColumnMapperProps> = ({
  csvHeaders,
  mappings,
  onMappingChange,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        カラムマッピング
      </h3>
      <p className="text-sm text-gray-600">
        CSVの各カラムを収支フィールドにマッピングしてください
      </p>
      
      <div className="space-y-3">
        {csvHeaders.map((header, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                CSV カラム: <span className="font-semibold">{header}</span>
              </label>
            </div>
            <div className="flex-1">
              <select
                value={mappings[index]?.transactionField || 'skip'}
                onChange={(e) =>
                  onMappingChange(index, e.target.value as ColumnMapping['transactionField'])
                }
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                {TRANSACTION_FIELDS.map((field) => (
                  <option key={field.value} value={field.value}>
                    {field.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          マッピング状況
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>
            日付: {mappings.find((m) => m.transactionField === 'date')?.csvColumn || '未設定'}
          </li>
          <li>
            金額: {mappings.find((m) => m.transactionField === 'amount')?.csvColumn || '未設定'}
          </li>
          <li>
            カテゴリ: {mappings.find((m) => m.transactionField === 'category')?.csvColumn || '未設定'}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ColumnMapper;
