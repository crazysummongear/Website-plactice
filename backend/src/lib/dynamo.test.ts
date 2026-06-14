import { describe, it, expect, beforeEach } from '@jest/globals';

// Use manual mock for dynamo module
jest.mock('./dynamo');

import * as dynamoModule from './dynamo';

describe('dynamo.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('put()', () => {
    it('should successfully put an item', async () => {
      const item = {
        PK: 'USER#123',
        SK: 'TX#2024-01-01#abc123',
        date: '2024-01-01',
        amount: 1000,
      };

      (dynamoModule.put as jest.Mock).mockResolvedValueOnce(undefined);

      await dynamoModule.put(item);

      expect(dynamoModule.put).toHaveBeenCalledWith(item);
    });

    it('should handle put with complex data', async () => {
      const item = {
        PK: 'USER#user-123',
        SK: 'TX#2024-01-15#tx-456',
        type: 'TRANSACTION',
        date: '2024-01-15',
        category: '食費',
        amount: 5000,
        incomeExpense: 'EXPENSE',
        memo: 'スーパー',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      };

      (dynamoModule.put as jest.Mock).mockResolvedValueOnce(undefined);

      await dynamoModule.put(item);

      expect(dynamoModule.put).toHaveBeenCalledWith(item);
    });

    it('should throw error when put fails', async () => {
      const item = { PK: 'USER#123', SK: 'TX#123' };
      const error = new Error('DynamoDB error');

      (dynamoModule.put as jest.Mock).mockRejectedValueOnce(error);

      await expect(dynamoModule.put(item)).rejects.toThrow('DynamoDB error');
    });
  });

  describe('get()', () => {
    it('should successfully get an item', async () => {
      const expectedItem = {
        PK: 'USER#123',
        SK: 'TX#2024-01-01#abc',
        amount: 1000,
      };

      (dynamoModule.get as jest.Mock).mockResolvedValueOnce(expectedItem);

      const result = await dynamoModule.get('USER#123', 'TX#2024-01-01#abc');

      expect(result).toEqual(expectedItem);
      expect(dynamoModule.get).toHaveBeenCalledWith('USER#123', 'TX#2024-01-01#abc');
    });

    it('should return null when item does not exist', async () => {
      (dynamoModule.get as jest.Mock).mockResolvedValueOnce(null);

      const result = await dynamoModule.get('USER#999', 'TX#notfound');

      expect(result).toBeNull();
    });

    it('should throw error when get fails', async () => {
      const error = new Error('DynamoDB read error');
      (dynamoModule.get as jest.Mock).mockRejectedValueOnce(error);

      await expect(dynamoModule.get('USER#123', 'TX#123')).rejects.toThrow(
        'DynamoDB read error'
      );
    });
  });

  describe('query()', () => {
    it('should successfully query items by partition key', async () => {
      const expectedItems = [
        { PK: 'USER#123', SK: 'TX#2024-01-01#1', amount: 1000 },
        { PK: 'USER#123', SK: 'TX#2024-01-02#2', amount: 2000 },
      ];

      (dynamoModule.query as jest.Mock).mockResolvedValueOnce(expectedItems);

      const result = await dynamoModule.query('USER#123');

      expect(result).toEqual(expectedItems);
      expect(dynamoModule.query).toHaveBeenCalledWith('USER#123');
    });

    it('should query items with sort key prefix', async () => {
      const expectedItems = [
        { PK: 'USER#123', SK: 'TX#2024-01-01#1', amount: 1000 },
        { PK: 'USER#123', SK: 'TX#2024-01-02#2', amount: 2000 },
      ];

      (dynamoModule.query as jest.Mock).mockResolvedValueOnce(expectedItems);

      const result = await dynamoModule.query('USER#123', 'TX#');

      expect(result).toEqual(expectedItems);
      expect(dynamoModule.query).toHaveBeenCalledWith('USER#123', 'TX#');
    });

    it('should return empty array when no items found', async () => {
      (dynamoModule.query as jest.Mock).mockResolvedValueOnce([]);

      const result = await dynamoModule.query('USER#999');

      expect(result).toEqual([]);
    });

    it('should handle query with no Items in response', async () => {
      (dynamoModule.query as jest.Mock).mockResolvedValueOnce([]);

      const result = await dynamoModule.query('USER#123');

      expect(result).toEqual([]);
    });

    it('should throw error when query fails', async () => {
      const error = new Error('Query error');
      (dynamoModule.query as jest.Mock).mockRejectedValueOnce(error);

      await expect(dynamoModule.query('USER#123')).rejects.toThrow('Query error');
    });
  });

  describe('update()', () => {
    it('should successfully update an item', async () => {
      const updates = { amount: 2000, memo: 'Updated' };
      const expectedResult = {
        PK: 'USER#123',
        SK: 'TX#123',
        amount: 2000,
        memo: 'Updated',
      };

      (dynamoModule.update as jest.Mock).mockResolvedValueOnce(expectedResult);

      const result = await dynamoModule.update('USER#123', 'TX#123', updates);

      expect(result).toEqual(expectedResult);
      expect(dynamoModule.update).toHaveBeenCalledWith('USER#123', 'TX#123', updates);
    });

    it('should handle update with multiple fields', async () => {
      const updates = {
        category: '交通費',
        amount: 3000,
        incomeExpense: 'EXPENSE',
        memo: 'Updated memo',
      };
      const expectedResult = {
        ...updates,
        PK: 'USER#123',
      };

      (dynamoModule.update as jest.Mock).mockResolvedValueOnce(expectedResult);

      const result = await dynamoModule.update('USER#123', 'TX#123', updates);

      expect(result.category).toBe('交通費');
      expect(result.amount).toBe(3000);
    });

    it('should return empty object when update returns no attributes', async () => {
      (dynamoModule.update as jest.Mock).mockResolvedValueOnce({});

      const result = await dynamoModule.update('USER#123', 'TX#123', { amount: 1000 });

      expect(result).toEqual({});
    });

    it('should throw error when update fails', async () => {
      const error = new Error('Update failed');
      (dynamoModule.update as jest.Mock).mockRejectedValueOnce(error);

      await expect(dynamoModule.update('USER#123', 'TX#123', { amount: 1000 })).rejects.toThrow(
        'Update failed'
      );
    });
  });

  describe('deleteItem()', () => {
    it('should successfully delete an item', async () => {
      (dynamoModule.deleteItem as jest.Mock).mockResolvedValueOnce(undefined);

      await dynamoModule.deleteItem('USER#123', 'TX#123');

      expect(dynamoModule.deleteItem).toHaveBeenCalledWith('USER#123', 'TX#123');
    });

    it('should not throw error when deleting non-existent item', async () => {
      (dynamoModule.deleteItem as jest.Mock).mockResolvedValueOnce(undefined);

      await expect(dynamoModule.deleteItem('USER#999', 'TX#notfound')).resolves.toBeUndefined();
    });

    it('should throw error when delete fails', async () => {
      const error = new Error('Delete failed');
      (dynamoModule.deleteItem as jest.Mock).mockRejectedValueOnce(error);

      await expect(dynamoModule.deleteItem('USER#123', 'TX#123')).rejects.toThrow('Delete failed');
    });
  });
});
