import { describe, it, expect, beforeEach } from '@jest/globals';
import { APIGatewayProxyEvent, S3Event } from 'aws-lambda';
import {
  getUploadUrl,
  handleS3Event,
} from './csv-import';
import * as auth from '../lib/auth';
import * as dynamo from '../lib/dynamo';

// Mock modules
jest.mock('../lib/auth');
jest.mock('../lib/dynamo');
jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner');

const mockGetUserId = jest.mocked(auth.getUserId);
const mockPut = jest.mocked(dynamo.put);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('csv-import.ts', () => {
  describe('getUploadUrl()', () => {
    it('should generate presigned URL for authenticated user', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'POST',
        path: '/csv/upload-url',
        requestContext: { authorizer: { claims: { sub: 'user-123' } } },
      } as any;

      mockGetUserId.mockReturnValue('user-123');

      // Mock the presigned URL generation
      const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
      jest.mocked(getSignedUrl).mockResolvedValue(
        'https://s3.amazonaws.com/bucket/key?signature=xyz'
      );

      const response = await getUploadUrl(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.uploadUrl).toBeDefined();
      expect(body.fileName).toContain('user-123/');
      expect(body.fileName).toMatch(/\.csv$/);
    });

    it('should generate different filename for each request', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'POST',
        path: '/csv/upload-url',
        requestContext: { authorizer: { claims: { sub: 'user-123' } } },
      } as any;

      mockGetUserId.mockReturnValue('user-123');

      const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
      jest.mocked(getSignedUrl).mockResolvedValue(
        'https://s3.amazonaws.com/bucket/key?signature=xyz'
      );

      const response1 = await getUploadUrl(event as APIGatewayProxyEvent);
      const response2 = await getUploadUrl(event as APIGatewayProxyEvent);

      const body1 = JSON.parse(response1.body);
      const body2 = JSON.parse(response2.body);

      expect(body1.fileName).not.toBe(body2.fileName);
    });

    it('should return 500 on error', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'POST',
        path: '/csv/upload-url',
        requestContext: { authorizer: { claims: { sub: 'user-123' } } },
      } as any;

      mockGetUserId.mockImplementation(() => {
        throw new Error('Auth failed');
      });

      const response = await getUploadUrl(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.body).error).toBe('Failed to generate upload URL');
    });
  });

  describe('handleS3Event()', () => {
    it('should parse and import CSV data from S3', async () => {
      const csvContent = `date,category,amount,incomeExpense,memo
2024-01-01,給料,300000,INCOME,1月給料
2024-01-15,食費,5000,EXPENSE,スーパー`;

      const event: Partial<S3Event> = {
        Records: [
          {
            s3: {
              bucket: { name: 'test-bucket' },
              object: { key: 'user-123/test.csv' },
            },
            eventSource: 'aws:s3',
          },
        ],
      } as any;

      // Mock S3 GetObjectCommand
      const { S3Client, GetObjectCommand } = await import('@aws-sdk/client-s3');
      jest.mocked(S3Client).mockImplementation(() => ({
        send: jest.fn().mockResolvedValue({
          Body: {
            transformToString: jest.fn().mockResolvedValue(csvContent),
          },
        }),
      } as any));

      mockPut.mockResolvedValue(undefined);

      await handleS3Event(event as S3Event);

      // Should create 2 transaction records
      expect(mockPut).toHaveBeenCalledTimes(2);
    });

    it('should handle BOM (Byte Order Mark) in UTF-8 CSV', async () => {
      // BOM prefix: \uFEFF
      const csvContent = '\uFEFFdate,category,amount,incomeExpense,memo\n2024-01-01,給料,300000,INCOME,1月給料';

      const event: Partial<S3Event> = {
        Records: [
          {
            s3: {
              bucket: { name: 'test-bucket' },
              object: { key: 'user-123/test-bom.csv' },
            },
            eventSource: 'aws:s3',
          },
        ],
      } as any;

      const { S3Client } = await import('@aws-sdk/client-s3');
      jest.mocked(S3Client).mockImplementation(() => ({
        send: jest.fn().mockResolvedValue({
          Body: {
            transformToString: jest.fn().mockResolvedValue(csvContent),
          },
        }),
      } as any));

      mockPut.mockResolvedValue(undefined);

      await handleS3Event(event as S3Event);

      // Should handle BOM correctly and create transaction
      expect(mockPut).toHaveBeenCalled();
    });

    it('should handle mixed line endings (CRLF and LF)', async () => {
      // Mixed: CRLF and LF
      const csvContent = 'date,category,amount,incomeExpense,memo\r\n2024-01-01,給料,300000,INCOME,1月給料\n2024-01-15,食費,5000,EXPENSE,スーパー';

      const event: Partial<S3Event> = {
        Records: [
          {
            s3: {
              bucket: { name: 'test-bucket' },
              object: { key: 'user-123/test-mixed.csv' },
            },
            eventSource: 'aws:s3',
          },
        ],
      } as any;

      const { S3Client } = await import('@aws-sdk/client-s3');
      jest.mocked(S3Client).mockImplementation(() => ({
        send: jest.fn().mockResolvedValue({
          Body: {
            transformToString: jest.fn().mockResolvedValue(csvContent),
          },
        }),
      } as any));

      mockPut.mockResolvedValue(undefined);

      await handleS3Event(event as S3Event);

      // Should handle mixed line endings and create 2 transactions
      expect(mockPut).toHaveBeenCalledTimes(2);
    });

    it('should handle error recovery when some records fail', async () => {
      const csvContent = `date,category,amount,incomeExpense,memo
2024-01-01,給料,300000,INCOME,1月給料
invalid-row-missing-fields
2024-01-15,食費,5000,EXPENSE,スーパー`;

      const event: Partial<S3Event> = {
        Records: [
          {
            s3: {
              bucket: { name: 'test-bucket' },
              object: { key: 'user-123/test-error.csv' },
            },
            eventSource: 'aws:s3',
          },
        ],
      } as any;

      const { S3Client } = await import('@aws-sdk/client-s3');
      jest.mocked(S3Client).mockImplementation(() => ({
        send: jest.fn().mockResolvedValue({
          Body: {
            transformToString: jest.fn().mockResolvedValue(csvContent),
          },
        }),
      } as any));

      mockPut.mockResolvedValue(undefined);

      // Should not throw error, but skip invalid records
      await expect(handleS3Event(event as S3Event)).resolves.toBeUndefined();
    });

    it('should handle partial failure during database operations', async () => {
      const csvContent = `date,category,amount,incomeExpense,memo
2024-01-01,給料,300000,INCOME,1月給料
2024-01-15,食費,5000,EXPENSE,スーパー`;

      const event: Partial<S3Event> = {
        Records: [
          {
            s3: {
              bucket: { name: 'test-bucket' },
              object: { key: 'user-123/test-db-error.csv' },
            },
            eventSource: 'aws:s3',
          },
        ],
      } as any;

      const { S3Client } = await import('@aws-sdk/client-s3');
      jest.mocked(S3Client).mockImplementation(() => ({
        send: jest.fn().mockResolvedValue({
          Body: {
            transformToString: jest.fn().mockResolvedValue(csvContent),
          },
        }),
      } as any));

      // First call succeeds, second fails
      mockPut.mockResolvedValueOnce(undefined);
      mockPut.mockRejectedValueOnce(new Error('DB connection lost'));
      mockPut.mockResolvedValueOnce(undefined); // Potential retry

      // Should continue processing despite one failure
      await expect(handleS3Event(event as S3Event)).resolves.not.toThrow();
    });

    it('should skip empty CSV lines', async () => {
      const csvContent = `date,category,amount,incomeExpense,memo
2024-01-01,給料,300000,INCOME,1月給料

2024-01-15,食費,5000,EXPENSE,スーパー`;

      const event: Partial<S3Event> = {
        Records: [
          {
            s3: {
              bucket: { name: 'test-bucket' },
              object: { key: 'user-123/test.csv' },
            },
            eventSource: 'aws:s3',
          },
        ],
      } as any;

      const { S3Client } = await import('@aws-sdk/client-s3');
      jest.mocked(S3Client).mockImplementation(() => ({
        send: jest.fn().mockResolvedValue({
          Body: {
            transformToString: jest.fn().mockResolvedValue(csvContent),
          },
        }),
      } as any));

      mockPut.mockResolvedValue(undefined);

      await handleS3Event(event as S3Event);

      // Should handle properly even with empty lines
      expect(mockPut).toHaveBeenCalled();
    });

    it('should handle missing CSV body gracefully', async () => {
      const event: Partial<S3Event> = {
        Records: [
          {
            s3: {
              bucket: { name: 'test-bucket' },
              object: { key: 'user-123/empty.csv' },
            },
            eventSource: 'aws:s3',
          },
        ],
      } as any;

      const { S3Client } = await import('@aws-sdk/client-s3');
      jest.mocked(S3Client).mockImplementation(() => ({
        send: jest.fn().mockResolvedValue({
          Body: {
            transformToString: jest.fn().mockResolvedValue(undefined),
          },
        }),
      } as any));

      // Should not throw error
      await expect(handleS3Event(event as S3Event)).resolves.toBeUndefined();
      expect(mockPut).not.toHaveBeenCalled();
    });

    it('should handle multiple S3 records', async () => {
      const csvContent = `date,category,amount,incomeExpense,memo
2024-01-01,給料,300000,INCOME,1月給料`;

      const event: Partial<S3Event> = {
        Records: [
          {
            s3: {
              bucket: { name: 'test-bucket' },
              object: { key: 'user-123/file1.csv' },
            },
            eventSource: 'aws:s3',
          },
          {
            s3: {
              bucket: { name: 'test-bucket' },
              object: { key: 'user-456/file2.csv' },
            },
            eventSource: 'aws:s3',
          },
        ],
      } as any;

      const { S3Client } = await import('@aws-sdk/client-s3');
      jest.mocked(S3Client).mockImplementation(() => ({
        send: jest.fn().mockResolvedValue({
          Body: {
            transformToString: jest.fn().mockResolvedValue(csvContent),
          },
        }),
      } as any));

      mockPut.mockResolvedValue(undefined);

      await handleS3Event(event as S3Event);

      // Should process both records
      expect(mockPut).toHaveBeenCalledTimes(2); // 1 row per CSV × 2 files
    });

    it('should handle S3 event with special characters in key', async () => {
      const csvContent = `date,category,amount,incomeExpense,memo
2024-01-01,給料,300000,INCOME,1月給料`;

      const event: Partial<S3Event> = {
        Records: [
          {
            s3: {
              bucket: { name: 'test-bucket' },
              object: { key: 'user-123/test%20file.csv' }, // URL encoded space
            },
            eventSource: 'aws:s3',
          },
        ],
      } as any;

      const { S3Client } = await import('@aws-sdk/client-s3');
      jest.mocked(S3Client).mockImplementation(() => ({
        send: jest.fn().mockResolvedValue({
          Body: {
            transformToString: jest.fn().mockResolvedValue(csvContent),
          },
        }),
      } as any));

      mockPut.mockResolvedValue(undefined);

      await expect(handleS3Event(event as S3Event)).resolves.toBeUndefined();
      expect(mockPut).toHaveBeenCalled();
    });
  });
});
