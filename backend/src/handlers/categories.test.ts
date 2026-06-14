import { describe, it, expect, beforeEach } from '@jest/globals';
import { APIGatewayProxyEvent } from 'aws-lambda';
import {
  getCategories,
  createCategory,
} from './categories';
import * as auth from '../lib/auth';
import * as dynamo from '../lib/dynamo';

// Mock modules
jest.mock('../lib/auth');
jest.mock('../lib/dynamo');

const mockGetUserId = jest.mocked(auth.getUserId);
const mockQuery = jest.mocked(dynamo.query);
const mockPut = jest.mocked(dynamo.put);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('categories.ts', () => {
  describe('getCategories()', () => {
    it('should return categories for authenticated user', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'GET',
        path: '/categories',
        requestContext: { authorizer: { claims: { sub: 'user-123' } } },
      } as any;

      const mockItems = [
        {
          PK: 'USER#user-123',
          SK: 'CAT#cat-1',
          type: 'CATEGORY',
          name: '給料',
          categoryType: 'INCOME',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          PK: 'USER#user-123',
          SK: 'CAT#cat-2',
          type: 'CATEGORY',
          name: '食費',
          categoryType: 'EXPENSE',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      mockGetUserId.mockReturnValue('user-123');
      mockQuery.mockResolvedValue(mockItems);

      const response = await getCategories(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.items).toHaveLength(2);
      expect(body.items[0].name).toBe('給料');
      expect(body.items[1].name).toBe('食費');
    });

    it('should return empty array when no categories exist', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'GET',
        path: '/categories',
        requestContext: { authorizer: { claims: { sub: 'user-123' } } },
      } as any;

      mockGetUserId.mockReturnValue('user-123');
      mockQuery.mockResolvedValue([]);

      const response = await getCategories(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.items).toEqual([]);
    });

    it('should return 500 on error', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'GET',
        path: '/categories',
        requestContext: { authorizer: { claims: { sub: 'user-123' } } },
      } as any;

      mockGetUserId.mockImplementation(() => {
        throw new Error('Auth failed');
      });

      const response = await getCategories(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.body).error).toBe('Failed to get categories');
    });
  });

  describe('createCategory()', () => {
    it('should create a new category', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'POST',
        path: '/categories',
        body: JSON.stringify({
          name: '交通費',
          type: 'EXPENSE',
        }),
        requestContext: { authorizer: { claims: { sub: 'user-123' } } },
      } as any;

      mockGetUserId.mockReturnValue('user-123');
      mockPut.mockResolvedValue(undefined);

      const response = await createCategory(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.id).toBeDefined();
      expect(body.userId).toBe('user-123');
      expect(body.name).toBe('交通費');
      expect(body.type).toBe('EXPENSE');
    });

    it('should create a category with INCOME type', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'POST',
        path: '/categories',
        body: JSON.stringify({
          name: 'ボーナス',
          type: 'INCOME',
        }),
        requestContext: { authorizer: { claims: { sub: 'user-123' } } },
      } as any;

      mockGetUserId.mockReturnValue('user-123');
      mockPut.mockResolvedValue(undefined);

      const response = await createCategory(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.type).toBe('INCOME');
    });

    it('should return 400 when required fields are missing', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'POST',
        path: '/categories',
        body: JSON.stringify({
          name: '食費',
          // missing type
        }),
        requestContext: { authorizer: { claims: { sub: 'user-123' } } },
      } as any;

      mockGetUserId.mockReturnValue('user-123');

      const response = await createCategory(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body).error).toBe('Missing required fields');
    });

    it('should return 400 when name is missing', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'POST',
        path: '/categories',
        body: JSON.stringify({
          // missing name
          type: 'EXPENSE',
        }),
        requestContext: { authorizer: { claims: { sub: 'user-123' } } },
      } as any;

      mockGetUserId.mockReturnValue('user-123');

      const response = await createCategory(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(400);
    });

    it('should return 500 on database error', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'POST',
        path: '/categories',
        body: JSON.stringify({
          name: '食費',
          type: 'EXPENSE',
        }),
        requestContext: { authorizer: { claims: { sub: 'user-123' } } },
      } as any;

      mockGetUserId.mockReturnValue('user-123');
      mockPut.mockRejectedValue(new Error('DB error'));

      const response = await createCategory(event as APIGatewayProxyEvent);

      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.body).error).toBe('Failed to create category');
    });
  });
});
