// 収支管理 Lambda ハンドラ
// STEP 6.1: transactions ハンドラ実装

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { successResponse, errorResponse } from '../lib/response';
import { getUserId } from '../lib/auth';
import { put, query, update, deleteItem, get } from '../lib/dynamo';
import { Transaction } from '../types/index';

/**
 * GET /transactions - 収支一覧取得
 */
export async function getTransactions(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    const userId = getUserId(event);
    const pk = `USER#${userId}`;
    
    // クエリパラメータを取得
    const { startDate, endDate, category, incomeExpense } = event.queryStringParameters || {};
    
    // DynamoDB から収支データを取得
    const items = await query(pk, 'TX#');
    
    // フィルタリング（アプリケーション側で実行）
    let transactions = items.map(item => ({
      id: item.SK.split('#')[2],
      userId: item.PK.split('#')[1],
      date: item.date,
      category: item.category,
      amount: item.amount,
      incomeExpense: item.incomeExpense,
      memo: item.memo,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
    
    // 日付フィルタ
    if (startDate) {
      transactions = transactions.filter(t => t.date >= startDate);
    }
    if (endDate) {
      transactions = transactions.filter(t => t.date <= endDate);
    }
    
    // カテゴリフィルタ
    if (category) {
      transactions = transactions.filter(t => t.category === category);
    }
    
    // 収入/支出フィルタ
    if (incomeExpense) {
      transactions = transactions.filter(t => t.incomeExpense === incomeExpense);
    }
    
    return successResponse({ items: transactions });
  } catch (error) {
    console.error('Error getting transactions:', error);
    return errorResponse('Failed to get transactions', 500);
  }
}

/**
 * POST /transactions - 収支登録
 */
export async function createTransaction(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    const userId = getUserId(event);
    const body = JSON.parse(event.body || '{}');
    
    // バリデーション
    if (!body.date || !body.category || !body.amount || !body.incomeExpense) {
      return errorResponse('Missing required fields', 400);
    }
    
    // UUID 生成
    const transactionId = uuidv4();
    const now = new Date().toISOString();
    
    // DynamoDB レコード作成
    const item = {
      PK: `USER#${userId}`,
      SK: `TX#${body.date}#${transactionId}`,
      type: 'TRANSACTION',
      date: body.date,
      category: body.category,
      amount: body.amount,
      incomeExpense: body.incomeExpense,
      memo: body.memo || '',
      createdAt: now,
      updatedAt: now,
    };
    
    await put(item);
    
    // レスポンス
    const transaction: Transaction = {
      id: transactionId,
      userId,
      date: body.date,
      category: body.category,
      amount: body.amount,
      incomeExpense: body.incomeExpense,
      memo: body.memo,
      createdAt: now,
      updatedAt: now,
    };
    
    return successResponse(transaction, 201);
  } catch (error) {
    console.error('Error creating transaction:', error);
    return errorResponse('Failed to create transaction', 500);
  }
}

/**
 * PUT /transactions/{id} - 収支更新
 */
export async function updateTransaction(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    const userId = getUserId(event);
    const transactionId = event.pathParameters?.id;
    const body = JSON.parse(event.body || '{}');
    
    if (!transactionId) {
      return errorResponse('Missing transaction ID', 400);
    }
    
    // 既存のトランザクションを取得（日付を取得するため）
    const items = await query(`USER#${userId}`, 'TX#');
    const existingItem = items.find(item => item.SK.endsWith(`#${transactionId}`));
    
    if (!existingItem) {
      return errorResponse('Transaction not found', 404);
    }
    
    // 更新データ
    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };
    
    if (body.category) updates.category = body.category;
    if (body.amount) updates.amount = body.amount;
    if (body.incomeExpense) updates.incomeExpense = body.incomeExpense;
    if (body.memo !== undefined) updates.memo = body.memo;
    
    // DynamoDB 更新
    const updated = await update(existingItem.PK, existingItem.SK, updates);
    
    // レスポンス
    const transaction: Transaction = {
      id: transactionId,
      userId,
      date: updated.date,
      category: updated.category,
      amount: updated.amount,
      incomeExpense: updated.incomeExpense,
      memo: updated.memo,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
    
    return successResponse(transaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    return errorResponse('Failed to update transaction', 500);
  }
}

/**
 * DELETE /transactions/{id} - 収支削除
 */
export async function deleteTransaction(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    const userId = getUserId(event);
    const transactionId = event.pathParameters?.id;
    
    if (!transactionId) {
      return errorResponse('Missing transaction ID', 400);
    }
    
    // 既存のトランザクションを取得（SK を取得するため）
    const items = await query(`USER#${userId}`, 'TX#');
    const existingItem = items.find(item => item.SK.endsWith(`#${transactionId}`));
    
    if (!existingItem) {
      return errorResponse('Transaction not found', 404);
    }
    
    // DynamoDB から削除
    await deleteItem(existingItem.PK, existingItem.SK);
    
    return successResponse({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return errorResponse('Failed to delete transaction', 500);
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
    if (method === 'GET' && path === '/transactions') {
      return await getTransactions(event);
    } else if (method === 'POST' && path === '/transactions') {
      return await createTransaction(event);
    } else if (method === 'PUT' && path.startsWith('/transactions/')) {
      return await updateTransaction(event);
    } else if (method === 'DELETE' && path.startsWith('/transactions/')) {
      return await deleteTransaction(event);
    } else {
      return errorResponse('Not Found', 404);
    }
  } catch (error) {
    console.error('Unhandled error:', error);
    return errorResponse('Internal Server Error', 500);
  }
}
