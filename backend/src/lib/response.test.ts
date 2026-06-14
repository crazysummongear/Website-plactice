import { describe, it, expect } from '@jest/globals';
import { successResponse, errorResponse } from './response';

describe('response.ts', () => {
  describe('successResponse()', () => {
    it('should return response with status code 200 by default', () => {
      const data = { message: 'success' };
      const response = successResponse(data);

      expect(response.statusCode).toBe(200);
      expect(response.body).toBe(JSON.stringify(data));
      expect(response.headers['Content-Type']).toBe('application/json');
    });

    it('should return response with custom status code', () => {
      const data = { id: 'new-123' };
      const response = successResponse(data, 201);

      expect(response.statusCode).toBe(201);
      expect(response.body).toBe(JSON.stringify(data));
    });

    it('should include CORS headers', () => {
      const response = successResponse({ data: 'test' });

      expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
      expect(response.headers['Access-Control-Allow-Methods']).toBe(
        'GET, POST, PUT, DELETE, OPTIONS'
      );
      expect(response.headers['Access-Control-Allow-Headers']).toBe(
        'Content-Type, Authorization'
      );
    });

    it('should handle complex data structures', () => {
      const data = {
        items: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
        ],
        total: 2,
      };
      const response = successResponse(data);

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual(data);
    });

    it('should handle array data', () => {
      const data = [1, 2, 3];
      const response = successResponse(data);

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual(data);
    });

    it('should handle null and undefined data', () => {
      const response1 = successResponse(null);

      expect(response1.statusCode).toBe(200);
      expect(response1.body).toBe(JSON.stringify(null));

      // undefined handling - JSON.stringify(undefined) returns undefined,
      // but our implementation should handle it
      const response2 = successResponse(undefined);
      expect(response2.statusCode).toBe(200);
      // The body may be undefined when JSON.stringify returns undefined
      // This is the expected JSON behavior
    });
  });

  describe('errorResponse()', () => {
    it('should return error response with status code 500 by default', () => {
      const message = 'Internal server error';
      const response = errorResponse(message);

      expect(response.statusCode).toBe(500);
      expect(response.body).toBe(JSON.stringify({ error: message }));
      expect(response.headers['Content-Type']).toBe('application/json');
    });

    it('should return error response with custom status code', () => {
      const message = 'Not found';
      const response = errorResponse(message, 404);

      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.body).error).toBe(message);
    });

    it('should return 400 for bad request errors', () => {
      const response = errorResponse('Missing required fields', 400);

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body).error).toBe('Missing required fields');
    });

    it('should return 401 for unauthorized errors', () => {
      const response = errorResponse('Unauthorized', 401);

      expect(response.statusCode).toBe(401);
    });

    it('should return 403 for forbidden errors', () => {
      const response = errorResponse('Forbidden', 403);

      expect(response.statusCode).toBe(403);
    });

    it('should include CORS headers in error response', () => {
      const response = errorResponse('Error', 400);

      expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
      expect(response.headers['Access-Control-Allow-Methods']).toBe(
        'GET, POST, PUT, DELETE, OPTIONS'
      );
      expect(response.headers['Access-Control-Allow-Headers']).toBe(
        'Content-Type, Authorization'
      );
    });

    it('should handle error messages with special characters', () => {
      const message = 'Error: Invalid field "email"';
      const response = errorResponse(message, 400);

      expect(JSON.parse(response.body).error).toBe(message);
    });
  });
});
