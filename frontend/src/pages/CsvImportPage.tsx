import { useState } from 'react';

/**
 * CSV Import Page
 * Allows users to upload CSV files for bulk transaction import
 */
export default function CsvImportPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      // TODO: Implement CSV upload logic
      // 1. Get presigned URL from API
      // 2. Upload file to S3
      // 3. Show success message
      console.log('Uploading file:', selectedFile.name);
      alert('CSV アップロード機能は実装中です');
    } catch (error) {
      console.error('Upload error:', error);
      alert('アップロードに失敗しました');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            CSV インポート
          </h1>

          <div className="space-y-6">
            <div>
              <label
                htmlFor="csv-file"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                CSV ファイルを選択
              </label>
              <input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-600">
                  選択されたファイル: {selectedFile.name}
                </p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                CSV フォーマット
              </h3>
              <p className="text-sm text-blue-700">
                日付, カテゴリ, 金額, 収入/支出, メモ
              </p>
              <p className="text-xs text-blue-600 mt-1">
                例: 2026-05-04, 食費, 1500, EXPENSE, スーパーで買い物
              </p>
            </div>

            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md
                hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed
                transition-colors"
            >
              {uploading ? 'アップロード中...' : 'アップロード'}
            </button>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            使い方
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>銀行やクレジットカードの明細を CSV 形式でダウンロード</li>
            <li>上記のフォーマットに合わせて CSV を編集</li>
            <li>ファイルを選択してアップロード</li>
            <li>自動的に取引データが登録されます</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
