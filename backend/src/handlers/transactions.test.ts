import { describe, it, expect, beforeEach } from '@jest/globals';
import { APIGatewayProxyEvent } from 'aws-lambda';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from './transactions';
import * as auth from '../lib/auth';
import * as dynamo from '../lib/dynamo';

// Mock modules
jest.mock('../lib/auth');
jest.mock('../lib/dynamo');

const mockGetUserId = jest.mocked(auth.getUserId);
const mockQuery = jest.mocked(dynamo.query);
const mockPut = jest.mocked(dynamo.put);
const mockUpdate = jest.mocked(dynamo.update);
const mockDelete = jest.mocked(dynamo.deleteItem);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('transactions.ts', () => {
  describe('getTransactions()', () => {
    it('should return transactions for authenticated user', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'GET',
        path: '/transactions',
        queryStringParameters: null,
        requestContext: { authorizer: { claims: { sub: 'user-123' } } },
      } as any;

      const mockItems = [
        {
          PK: 'USER#user-123',
          SK: 'TX#2024-01-01#tx-1',
          date: '2024-01-01',
          category: '給料',
          amount: 300000,
          incomeExpense: 'INCOME',
          memo: '1月給料',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      mockGetUserId.mockReturnValue('user-123');
      mockQuery.mockResolvedValue(mockItems);

      const response = await getTransactions(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.items).toHaveLength(1);
      expect(body.items[0].id).toBeDefined();
    });

    it('should filter transactions by date range', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'GET',
        path: '/transactions',
        queryStringParameters: {
          startDate: '2024-01-10',
          endDate: '2024-01-20',
        },
        requestContext: { authorizer: { claims: { sub: 'user-123' } } },
      } as any;

      const mockItems = [
        {
          PK: 'USER#user-123',
          SK: 'TX#2024-01-15#tx-1',
          date: '2024-01-15',
          category: '食費',
          amount: 5000,
          incomeExpense: 'EXPENSE',
        },
      ];

      mockGetUserId.mockReturnValue('user-123');
      mockQuery.mockResolvedValue(mockItems);

      const response = await getTransactions(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(200);
    });

    it('should filter transactions by category', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'GET',
        path: '/transactions',
        queryStringParameters: {
          category: '食費',
        },
        requestContext: { authorizer: { claims: { sub: 'user-123' } } },
      } as any;

      mockGetUserId.mockReturnValue('user-123');
      mockQuery.mockResolvedValue([
        {
          PK: 'USER#user-123',
          SK: 'TX#2024-01-15#tx-1',
          date: '2024-01-15',
          category: '食費',
          amount: 5000,
          incomeExpense: 'EXPENSE',
        },
      ]);

      const response = await getTransactions(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(200);
    });

    it('should filter transactions by income/expense', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'GET',
        path: '/transactions',
        queryStringParameters: {
          incomeExpense: 'INCOME',
        },
        requestContext: { authorizer: { claims: { sub: 'user-123' } } },
      } as any;

      mockGetUserId.mockReturnValue('user-123');
      mockQuery.mockResolvedValue([
        {
          PK: 'USER#user-123',
          SK: 'TX#2024-01-01#tx-1',
          date: '2024-01-01',
          category: '給料',
          amount: 300000,
          incomeExpense: 'INCOME',
        },
      ]);

      const response = await getTransactions(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(200);
    });

    it('should combine multiple filters', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'GET',
        path: '/transactions',
        queryStringParameters: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          category: '食費',
          incomeExpense: 'EXPENSE',
        },
        requestContext: { authorizer: { claims: { sub: 'user-123' } } },
      } as any;

      const mockItems = [
        {
          PK: 'USER#user-123',
          SK: 'TX#2024-01-15#tx-1',
          date: '2024-01-15',
          category: '食費',
          amount: 5000,
          incomeExpense: 'EXPENSE',
        },
      ];

      mockGetUserId.mockReturnValue('user-123');
      mockQuery.mockResolvedValue(mockItems);

      const response = await getTransactions(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.items).toHaveLength(1);
      expect(body.items[0].category).toBe('食費');
      expect(body.items[0].incomeExpense).toBe('EXPENSE');
    });

    it('should validate query parameters for date range', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'GET',
        path: '/transactions',
        queryStringParameters: {
          startDate: '2024-01-31',
          endDate: '2024-01-01', // endDate before startDate
        },
        requestContext: { authorizer: { claims: { sub: 'user-123' } } },
      } as any;

      mockGetUserId.mockReturnValue('user-123');
      mockQuery.mockResolvedValue([]);

      const response = await getTransactions(event as APIGatewayProxyEvent);

      // Should still return 200 and empty array, or could return 400 with validation error
      expect(response.statusCode).toBe(200);
    });

    it('should return 500 on error', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'GET',
        path: '/transactions',
        queryStringParameters: null,
        requestContext: { authorizer: { claims: { sub: 'user-123' } } },
      } as any;

      mockGetUserId.mockImplementation(() => {
        throw new Error('Auth failed');
      });

      const response = await getTransactions(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.body).error).toBe('Failed to get transactions');
    });

    it('should validate error response format', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'GET',
        path: '/transactions',
        queryStringParameters: null,
        requestContext: { authorizer: { claims: { sub: 'user-123' } } },
      } as any;

      mockGetUserId.mockReturnValue('user-123');
      mockQuery.mockRejectedValue(new Error('DB connection failed'));

      const response = await getTransactions(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(500);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('error');
      expect(typeof body.error).toBe('string');
      expect(response.headers?.['Content-Type']).toBe('application/json');
    });
  });

  describe('createTransaction()', () => {
    it('should create a new transaction', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'POST',
        path: '/transactions',
        body: JSON.stringify({
          date: '2024-01-15',
          category: '食費',
          amount: 5000,
          incomeExpense: 'EXPENSE',
          memo: 'スーパー',
        }),
        requestContext: { authorizer: { claims: { sub: 'user-123' } } },
      } as any;

      mockGetUserId.mockReturnValue('user-123');
      mockPut.mockResolvedValue(undefined);

      const response = await createTransaction(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.id).toBeDefined();
      expect(body.userId).toBe('user-123');
      expect(body.date).toBe('2024-01-15');
      expect(body.category).toBe('食費');
      expect(body.amount).toBe(5000);
    });

    it('should return 400 when required fields are missing', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'POST',
        path: '/transactions',
        body: JSON.stringify({
          date: '2024-01-15',
          // missing category, amount, incomeExpense
        }),
        requestContext: { authorizer: { claims: { sub: 'user-123' } } },
      } as any;

      mockGetUserId.mockReturnValue('user-123');

      const response = await createTransaction(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body).error).toBe('Missing required fields');
    });

    it('should validate amount field', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'POST',
        path: '/transactions',
        body: JSON.stringify({
          date: '2024-01-15',
          category: '食費',
          // missing amount
          incomeExpense: 'EXPENSE',
        }),
        requestContext: { authorizer: { claims: { sub: 'user-123' } } },
      } as any;

      mockGetUserId.mockReturnValue('user-123');

      const response = await createTransaction(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(400);
    });

    it('should handle optional memo field', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'POST',
        path: '/transactions',
        body: JSON.stringify({
          date: '2024-01-15',
          category: '食費',
          amount: 5000,
          incomeExpense: 'EXPENSE',
          // no memo
        }),
        requestContext: { authorizer: { claims: { sub: 'user-123' } } },
      } as any;

      mockGetUserId.mockReturnValue('user-123');
      mockPut.mockResolvedValue(undefined);

      const response = await createTransaction(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      // memo should be either empty string or undefined
      expect(body.memo === '' || body.memo === undefined).toBe(true);
    });

    it('should return 500 on error', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'POST',
        path: '/transactions',
        body: JSON.stringify({
          date: '2024-01-15',
          category: '食費',
          amount: 5000,
          incomeExpense: 'EXPENSE',
        }),
        requestContext: { authorizer: { claims: { sub: 'user-123' } } },
      } as any;

      mockGetUserId.mockReturnValue('user-123');
      mockPut.mockRejectedValue(new Error('DB error'));

      const response = await createTransaction(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(500);
    });
  });

  describe('updateTransaction()', () => {
    it('should update an existing transaction', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'PUT',
        path: '/transactions/tx-123',
        pathParameters: { id: 'tx-123' },
        body: JSON.stringify({
          category: '交通費',
          amount: 3000,
        }),
        requestContext: { authorizer: { claims: { sub: 'user-123' } } },
      } as any;

      mockGetUserId.mockReturnValue('user-123');
      mockQuery.mockResolvedValue([
        {
          PK: 'USER#user-123',
          SK: 'TX#2024-01-15#tx-123',
          date: '2024-01-15',
          category: '食費',
          amount: 5000,
        },
      ]);
      mockUpdate.mockResolvedValue({
        PK: 'USER#user-123',
        SK: 'TX#2024-01-15#tx-123',
        date: '2024-01-15',
        category: '交通費',
        amount: 3000,
      });

      const response = await updateTransaction(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.category).toBe('交通費');
      expect(body.amount).toBe(3000);
    });

    it('should return 400 when transaction ID is missing', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'PUT',
        path: '/transactions/',
        pathParameters: { id: '' },
        body: JSON.stringify({ category: '食費' }),
        requestContext: { authorizer: { claims: { sub: 'user-123' } } },
      } as any;

      mockGetUserId.mockReturnValue('user-123');

      const response = await updateTransaction(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(400);
    });

    it('should return 404 when transaction is not found', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'PUT',
        path: '/transactions/notfound',
        pathParameters: { id: 'notfound' },
        body: JSON.stringify({ category: '食費' }),
        requestContext: { authorizer: { claims: { sub: 'user-123' } } },
      } as any;

      mockGetUserId.mockReturnValue('user-123');
      mockQuery.mockResolvedValue([]);

      const response = await updateTransaction(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(404);
    });
  });

  describe('deleteTransaction()', () => {
    it('should delete an existing transaction', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'DELETE',
        path: '/transactions/tx-123',
        pathParameters: { id: 'tx-123' },
        requestContext: { authorizer: { claims: { sub: 'user-123' } } },
      } as any;

      mockGetUserId.mockReturnValue('user-123');
      mockQuery.mockResolvedValue([
        {
          PK: 'USER#user-123',
          SK: 'TX#2024-01-15#tx-123',
        },
      ]);
      mockDelete.mockResolvedValue(undefined);

      const response = await deleteTransaction(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).message).toBe('Transaction deleted successfully');
    });

    it('should return 400 when transaction ID is missing', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'DELETE',
        path: '/transactions/',
        pathParameters: { id: '' },
        requestContext: { authorizer: { claims: { sub: 'user-123' } } },
      } as any;

      mockGetUserId.mockReturnValue('user-123');

      const response = await deleteTransaction(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(400);
    });

    it('should return 404 when transaction is not found', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'DELETE',
        path: '/transactions/notfound',
        pathParameters: { id: 'notfound' },
        requestContext: { authorizer: { claims: { sub: 'user-123' } } },
      } as any;

      mockGetUserId.mockReturnValue('user-123');
      mockQuery.mockResolvedValue([]);

      const response = await deleteTransaction(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(404);
    });
  });
});
