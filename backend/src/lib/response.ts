// レスポンスヘルパー
// STEP 5.3: レスポンスヘルパー実装

import { ApiResponse } from '../types/index.js';

/**
 * CORS ヘッダー
 */
const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*', // 本番環境では具体的なドメインを指定
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * 成功レスポンスを生成
 */
export function successResponse<T>(data: T, statusCode: number = 200): ApiResponse<T> {
  return {
    statusCode,
    body: JSON.stringify(data),
    headers: CORS_HEADERS,
  };
}

/**
 * エラーレスポンスを生成
 */
export function errorResponse(message: string, statusCode: number = 500): ApiResponse {
  return {
    statusCode,
    body: JSON.stringify({ error: message }),
    headers: CORS_HEADERS,
  };
}
