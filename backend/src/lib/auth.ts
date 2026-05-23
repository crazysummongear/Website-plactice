// 認証ヘルパー
// STEP 5.4: 認証ヘルパー実装

import { APIGatewayProxyEvent } from 'aws-lambda';

/**
 * JWT トークンからユーザー ID を取得
 * 
 * API Gateway の Cognito Authorizer が検証済みのため、
 * ここでは単純に claims からユーザー ID を取り出すだけ
 */
export function getUserId(event: APIGatewayProxyEvent): string {
  // Cognito Authorizer が設定した claims を取得
  const claims = event.requestContext.authorizer?.claims;
  
  if (!claims || !claims.sub) {
    throw new Error('Unauthorized: No user ID found in token');
  }
  
  return claims.sub as string;
}

/**
 * JWT トークンを検証（API Gateway の Cognito Authorizer が実行）
 * 
 * 注: この関数は実際には使用されない
 * API Gateway の Cognito Authorizer が自動的にトークンを検証する
 */
export function verifyToken(token: string): boolean {
  // API Gateway の Cognito Authorizer が検証するため、
  // Lambda 関数内では検証不要
  return true;
}
