import { describe, it, expect } from '@jest/globals';
import { getUserId, verifyToken } from './auth';
import { APIGatewayProxyEvent } from 'aws-lambda';

describe('auth.ts', () => {
  describe('getUserId()', () => {
    it('should extract user ID from valid event', () => {
      const event: Partial<APIGatewayProxyEvent> = {
        requestContext: {
          authorizer: {
            claims: {
              sub: 'user-123-456',
              email: 'test@example.com',
            },
          },
        },
      } as any;

      const userId = getUserId(event as APIGatewayProxyEvent);

      expect(userId).toBe('user-123-456');
    });

    it('should throw error when claims are missing', () => {
      const event: Partial<APIGatewayProxyEvent> = {
        requestContext: {
          authorizer: {
            claims: null,
          },
        },
      } as any;

      expect(() => getUserId(event as APIGatewayProxyEvent)).toThrow(
        'Unauthorized: No user ID found in token'
      );
    });

    it('should throw error when sub is missing from claims', () => {
      const event: Partial<APIGatewayProxyEvent> = {
        requestContext: {
          authorizer: {
            claims: {
              email: 'test@example.com',
            },
          },
        },
      } as any;

      expect(() => getUserId(event as APIGatewayProxyEvent)).toThrow(
        'Unauthorized: No user ID found in token'
      );
    });

    it('should throw error when authorizer is undefined', () => {
      const event: Partial<APIGatewayProxyEvent> = {
        requestContext: {
          authorizer: undefined,
        },
      } as any;

      expect(() => getUserId(event as APIGatewayProxyEvent)).toThrow(
        'Unauthorized: No user ID found in token'
      );
    });
  });

  describe('verifyToken()', () => {
    it('should return true (token verification delegated to API Gateway)', () => {
      const token = 'any-token';
      const result = verifyToken(token);

      expect(result).toBe(true);
    });

    it('should always return true regardless of token value', () => {
      expect(verifyToken('')).toBe(true);
      expect(verifyToken('invalid-token')).toBe(true);
      expect(verifyToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')).toBe(true);
    });
  });
});
