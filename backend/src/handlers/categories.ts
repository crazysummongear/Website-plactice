// カテゴリ管理 Lambda ハンドラ
// STEP 6.2: categories ハンドラ実装

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { successResponse, errorResponse } from '../lib/response.js';
import { getUserId } from '../lib/auth.js';
import { put, query } from '../lib/dynamo.js';
import { Category } from '../types/index.js';

/**
 * GET /categories - カテゴリ一覧取得
 */
export async function getCategories(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    const userId = getUserId(event);
    const pk = `USER#${userId}`;
    
    // DynamoDB からカテゴリデータを取得
    const items = await query(pk, 'CAT#');
    
    const categories = items.map(item => ({
      id: item.SK.split('#')[1],
      userId: item.PK.split('#')[1],
      name: item.name,
      type: item.type,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
    
    return successResponse({ items: categories });
  } catch (error) {
    console.error('Error getting categories:', error);
    return errorResponse('Failed to get categories', 500);
  }
}

/**
 * POST /categories - カテゴリ登録
 */
export async function createCategory(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    const userId = getUserId(event);
    const body = JSON.parse(event.body || '{}');
    
    // バリデーション
    if (!body.name || !body.type) {
      return errorResponse('Missing required fields', 400);
    }
    
    // UUID 生成
    const categoryId = uuidv4();
    const now = new Date().toISOString();
    
    // DynamoDB レコード作成
    const item = {
      PK: `USER#${userId}`,
      SK: `CAT#${categoryId}`,
      type: 'CATEGORY',
      name: body.name,
      categoryType: body.type, // INCOME or EXPENSE
      createdAt: now,
      updatedAt: now,
    };
    
    await put(item);
    
    // レスポンス
    const category: Category = {
      id: categoryId,
      userId,
      name: body.name,
      type: body.type,
      createdAt: now,
      updatedAt: now,
    };
    
    return successResponse(category, 201);
  } catch (error) {
    console.error('Error creating category:', error);
    return errorResponse('Failed to create category', 500);
  }
}

/**
 * Lambda ハンドラ（ルーティング）
 */
export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  const method = event.httpMethod;
  const path = event.path;
  
  try {
    if (method === 'GET' && path === '/categories') {
      return await getCategories(event);
    } else if (method === 'POST' && path === '/categories') {
      return await createCategory(event);
    } else {
      return errorResponse('Not Found', 404);
    }
  } catch (error) {
    console.error('Unhandled error:', error);
    return errorResponse('Internal Server Error', 500);
  }
}
