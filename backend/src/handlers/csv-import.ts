// CSV インポート Lambda ハンドラ
// STEP 6.3: csv-import ハンドラ実装

import { APIGatewayProxyEvent, APIGatewayProxyResult, S3Event } from 'aws-lambda';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { successResponse, errorResponse } from '../lib/response.js';
import { getUserId } from '../lib/auth.js';
import { put } from '../lib/dynamo.js';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({ region: process.env.AWS_REGION || 'ap-northeast-1' });
const BUCKET_NAME = process.env.BUCKET_NAME || 'kakei-csv-temp-dev-839706991336';

/**
 * POST /csv/upload-url - Presigned URL 発行
 */
export async function getUploadUrl(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    const userId = getUserId(event);
    const fileName = `${userId}/${uuidv4()}.csv`;
    
    // Presigned URL を生成（15 分間有効）
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      ContentType: 'text/csv',
    });
    
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
    
    return successResponse({
      uploadUrl,
      fileName,
    });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return errorResponse('Failed to generate upload URL', 500);
  }
}

/**
 * S3 イベントトリガーハンドラ
 * CSV ファイルがアップロードされたら自動実行
 */
export async function handleS3Event(event: S3Event): Promise<void> {
  console.log('S3 Event:', JSON.stringify(event, null, 2));
  
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
    
    try {
      // S3 から CSV ファイルを取得
      const command = new GetObjectCommand({ Bucket: bucket, Key: key });
      const response = await s3Client.send(command);
      const csvContent = await response.Body?.transformToString();
      
      if (!csvContent) {
        console.error('Empty CSV file');
        continue;
      }
      
      // CSV をパース
      const lines = csvContent.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',');
      
      // ユーザー ID を key から取得
      const userId = key.split('/')[0];
      
      // 各行を DynamoDB に保存
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const row: Record<string, string> = {};
        
        headers.forEach((header, index) => {
          row[header.trim()] = values[index]?.trim() || '';
        });
        
        // トランザクションレコードを作成
        const transactionId = uuidv4();
        const now = new Date().toISOString();
        
        const item = {
          PK: `USER#${userId}`,
          SK: `TX#${row.date}#${transactionId}`,
          type: 'TRANSACTION',
          date: row.date,
          category: row.category,
          amount: parseInt(row.amount, 10),
          incomeExpense: row.incomeExpense,
          memo: row.memo || '',
          createdAt: now,
          updatedAt: now,
        };
        
        await put(item);
      }
      
      console.log(`Successfully imported ${lines.length - 1} transactions from ${key}`);
    } catch (error) {
      console.error(`Error processing ${key}:`, error);
    }
  }
}

/**
 * Lambda ハンドラ（ルーティング）
 */
export async function handler(
  event: APIGatewayProxyEvent | S3Event
): Promise<APIGatewayProxyResult | void> {
  // S3 イベントかどうかを判定
  if ('Records' in event && event.Records[0]?.eventSource === 'aws:s3') {
    return await handleS3Event(event as S3Event);
  }
  
  // API Gateway イベント
  const apiEvent = event as APIGatewayProxyEvent;
  console.log('Event:', JSON.stringify(apiEvent, null, 2));
  
  const method = apiEvent.httpMethod;
  const path = apiEvent.path;
  
  try {
    if (method === 'POST' && path === '/csv/upload-url') {
      return await getUploadUrl(apiEvent);
    } else {
      return errorResponse('Not Found', 404);
    }
  } catch (error) {
    console.error('Unhandled error:', error);
    return errorResponse('Internal Server Error', 500);
  }
}
