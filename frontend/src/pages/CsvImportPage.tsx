import { useState } from 'react';
import { importCsv } from '../api/csv';

/**
 * Message type for UI feedback
 */
type MessageType = 'success' | 'error' | null;

/**
 * CSV Import Page
 * Allows users to upload CSV files for bulk transaction import
 */
export default function CsvImportPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<{ type: MessageType; text: string }>({
    type: null,
    text: '',
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.csv')) {
        setMessage({
          type: 'error',
          text: 'CSV ファイルのみアップロード可能です',
        });
        return;
      }

      // Validate file size (max 10MB)
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB
      if (file.size > MAX_SIZE) {
        setMessage({
          type: 'error',
          text: 'ファイルサイズが大きすぎます（最大 10MB）',
        });
        return;
      }

      setSelectedFile(file);
      setMessage({ type: null, text: '' });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setProgress(0);
    setMessage({ type: null, text: '' });

    try {
      // Simulate progress: 30% after starting
      setProgress(30);
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Perform the upload
      const fileName = await importCsv(selectedFile);

      // Progress: 100%
      setProgress(100);

      // Show success message
      setMessage({
        type: 'success',
        text: `✅ CSV ファイル「${fileName}」のアップロードに成功しました。データは自動的に取得できます。`,
      });

      // Reset state after success
      setTimeout(() => {
        setSelectedFile(null);
        setProgress(0);
      }, 2000);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'アップロード中にエラーが発生しました';

      setMessage({
        type: 'error',
        text: `❌ エラー: ${errorMessage}`,
      });

      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 pb-20 md:pb-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            CSV インポート
          </h1>

          <div className="space-y-6">
            {/* File Selection Field */}
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
                data-testid="csv-file-input"
                accept=".csv"
                onChange={handleFileChange}
                disabled={uploading}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100 disabled:opacity-50
                  disabled:cursor-not-allowed"
              />
              {selectedFile && !uploading && (
                <p className="mt-2 text-sm text-gray-600">
                  ✓ 選択されたファイル: <span className="font-medium">{selectedFile.name}</span>
                  <span className="text-gray-500 ml-2">
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </p>
              )}
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-gray-700">
                    アップロード中...
                  </p>
                  <span className="text-sm text-gray-600">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    data-testid="csv-progress-bar"
                    className="bg-blue-600 h-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Message Display */}
            {message.type && (
              <div
                data-testid="csv-message"
                className={`p-4 rounded-md border ${
                  message.type === 'success'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <p
                  className={`text-sm font-medium ${
                    message.type === 'success'
                      ? 'text-green-800'
                      : 'text-red-800'
                  }`}
                >
                  {message.text}
                </p>
              </div>
            )}

            {/* Format Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                📋 CSV フォーマット
              </h3>
              <p className="text-sm text-blue-700 font-mono mb-2">
                日付, カテゴリ, 金額, 収入/支出, メモ
              </p>
              <p className="text-xs text-blue-600 font-mono">
                例: 2026-05-04, 食費, 1500, EXPENSE, スーパーで買い物
              </p>
            </div>

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              data-testid="csv-upload-button"
              disabled={!selectedFile || uploading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md
                hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed
                transition-colors font-medium"
            >
              {uploading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  アップロード中...
                </span>
              ) : (
                'アップロード'
              )}
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            📖 使い方
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>銀行やクレジットカードの明細を CSV 形式でダウンロード</li>
            <li>上記のフォーマットに合わせて CSV を編集</li>
            <li>ファイルを選択してアップロード</li>
            <li>自動的に取引データが登録されます</li>
          </ol>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-yellow-900 mb-2">
            💡 ヒント
          </h3>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• 最大ファイルサイズ: 10MB</li>
            <li>• .csv 形式のみサポート</li>
            <li>• 文字コードは UTF-8 を推奨</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
