// 型定義ファイル
// STEP 5.1: 型定義

/**
 * 収支レコード型
 */
export interface Transaction {
  id: string;
  userId: string;
  date: string; // ISO 8601 形式（YYYY-MM-DD）
  category: string;
  amount: number;
  incomeExpense: 'INCOME' | 'EXPENSE';
  memo?: string;
  createdAt: string; // ISO 8601 形式
  updatedAt: string; // ISO 8601 形式
}

/**
 * カテゴリ型
 */
export interface Category {
  id: string;
  userId: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  createdAt: string;
  updatedAt: string;
}

/**
 * API レスポンス型
 */
export interface ApiResponse<T = any> {
  statusCode: number;
  body: string;
  headers: {
    'Content-Type': string;
    'Access-Control-Allow-Origin': string;
    'Access-Control-Allow-Methods': string;
    'Access-Control-Allow-Headers': string;
  };
}

/**
 * DynamoDB レコード型（内部用）
 */
export interface DynamoDBRecord {
  PK: string; // USER#userId
  SK: string; // TX#date#txId または CAT#categoryId
  type: 'TRANSACTION' | 'CATEGORY';
  [key: string]: any;
}

/**
 * 収支作成リクエストボディ型
 */
export interface CreateTransactionRequest {
  date: string;
  category: string;
  amount: number;
  incomeExpense: 'INCOME' | 'EXPENSE';
  memo?: string;
}

/**
 * 収支更新リクエストボディ型
 */
export interface UpdateTransactionRequest {
  category?: string;
  amount?: number;
  incomeExpense?: 'INCOME' | 'EXPENSE';
  memo?: string;
}

/**
 * 収支クエリパラメータ型
 */
export interface TransactionQueryParams {
  startDate?: string;
  endDate?: string;
  category?: string;
  incomeExpense?: 'INCOME' | 'EXPENSE';
}

/**
 * カテゴリ作成リクエストボディ型
 */
export interface CreateCategoryRequest {
  name: string;
  type: 'INCOME' | 'EXPENSE';
}

/**
 * 収支サマリー型（ダッシュボード用）
 */
export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

/**
 * 収支一覧レスポンス型
 */
export interface TransactionListResponse {
  items: Transaction[];
  summary?: TransactionSummary;
}

/**
 * カテゴリ一覧レスポンス型
 */
export interface CategoryListResponse {
  items: Category[];
}

/**
 * CSV アップロード URL レスポンス型
 */
export interface CsvUploadUrlResponse {
  uploadUrl: string;
  fileName: string;
}
