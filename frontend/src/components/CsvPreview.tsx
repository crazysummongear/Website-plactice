/**
 * CSV Preview Component
 * Displays a preview of CSV data in a table format
 */

import React from 'react';

export interface CsvPreviewProps {
  data: string[][];
  maxRows?: number;
}

export const CsvPreview: React.FC<CsvPreviewProps> = ({ data, maxRows = 10 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No data to preview
      </div>
    );
  }

  const headers = data[0];
  const rows = data.slice(1, maxRows + 1);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length > maxRows + 1 && (
        <div className="text-center py-4 text-sm text-gray-500">
          Showing {maxRows} of {data.length - 1} rows
        </div>
      )}
    </div>
  );
};

export default CsvPreview;
