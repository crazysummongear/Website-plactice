// DynamoDB ヘルパー
// STEP 5.2: DynamoDB ヘルパー実装

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
  GetCommand,
} from '@aws-sdk/lib-dynamodb';

// DynamoDB クライアントを初期化
const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-northeast-1' });
const docClient = DynamoDBDocumentClient.from(client);

// テーブル名を環境変数から取得
const TABLE_NAME = process.env.TABLE_NAME || 'KakeiTable';

/**
 * アイテムを追加
 */
export async function put(item: Record<string, any>): Promise<void> {
  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: item,
  });
  
  await docClient.send(command);
}

/**
 * アイテムを取得
 */
export async function get(pk: string, sk: string): Promise<Record<string, any> | null> {
  const command = new GetCommand({
    TableName: TABLE_NAME,
    Key: { PK: pk, SK: sk },
  });
  
  const result = await docClient.send(command);
  return result.Item || null;
}

/**
 * クエリ実行（パーティションキーで検索）
 */
export async function query(
  pk: string,
  skPrefix?: string
): Promise<Record<string, any>[]> {
  const params: any = {
    TableName: TABLE_NAME,
    KeyConditionExpression: skPrefix
      ? 'PK = :pk AND begins_with(SK, :sk)'
      : 'PK = :pk',
    ExpressionAttributeValues: skPrefix
      ? { ':pk': pk, ':sk': skPrefix }
      : { ':pk': pk },
  };
  
  const command = new QueryCommand(params);
  const result = await docClient.send(command);
  
  return result.Items || [];
}

/**
 * アイテムを更新
 */
export async function update(
  pk: string,
  sk: string,
  updates: Record<string, any>
): Promise<Record<string, any>> {
  // 更新式を動的に生成
  const updateExpressions: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, any> = {};
  
  Object.keys(updates).forEach((key, index) => {
    const placeholder = `#attr${index}`;
    const valuePlaceholder = `:val${index}`;
    
    updateExpressions.push(`${placeholder} = ${valuePlaceholder}`);
    expressionAttributeNames[placeholder] = key;
    expressionAttributeValues[valuePlaceholder] = updates[key];
  });
  
  const command = new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { PK: pk, SK: sk },
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW',
  });
  
  const result = await docClient.send(command);
  return result.Attributes || {};
}

/**
 * アイテムを削除
 */
export async function deleteItem(pk: string, sk: string): Promise<void> {
  const command = new DeleteCommand({
    TableName: TABLE_NAME,
    Key: { PK: pk, SK: sk },
  });
  
  await docClient.send(command);
}
