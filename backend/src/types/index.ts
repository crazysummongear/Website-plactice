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
