/**
 * CSV API Client Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getPresignedUrl, uploadCsvToS3, importCsv } from './csv';

// Mock fetch globally
global.fetch = vi.fn();

describe('CSV API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock localStorage
    Storage.prototype.getItem = vi.fn((key: string) => {
      if (key === 'idToken') return 'mock-id-token';
      return null;
    });
  });

  describe('getPresignedUrl', () => {
    it('should successfully get presigned URL', async () => {
      const mockResponse = {
        uploadUrl: 'https://s3.amazonaws.com/bucket/key?signature=xyz',
        fileName: 'user-123/file-456.csv',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getPresignedUrl();

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/csv/upload-url'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-id-token',
          }),
        })
      );
    });

    it('should throw error when not authenticated', async () => {
      Storage.prototype.getItem = vi.fn(() => null);

      await expect(getPresignedUrl()).rejects.toThrow('Not authenticated');
    });

    it('should throw error when API returns error', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Failed to generate URL' }),
      });

      await expect(getPresignedUrl()).rejects.toThrow('Failed to generate URL');
    });
  });

  describe('uploadCsvToS3', () => {
    it('should successfully upload CSV to S3', async () => {
      const mockFile = new File(['date,amount\n2024-01-01,1000'], 'test.csv', {
        type: 'text/csv',
      });
      const uploadUrl = 'https://s3.amazonaws.com/bucket/key?signature=xyz';

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
      });

      await uploadCsvToS3(mockFile, uploadUrl);

      expect(global.fetch).toHaveBeenCalledWith(
        uploadUrl,
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'text/csv',
          }),
          body: mockFile,
        })
      );
    });

    it('should throw error when S3 upload fails', async () => {
      const mockFile = new File(['date,amount\n2024-01-01,1000'], 'test.csv', {
        type: 'text/csv',
      });
      const uploadUrl = 'https://s3.amazonaws.com/bucket/key?signature=xyz';

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 403,
      });

      await expect(uploadCsvToS3(mockFile, uploadUrl)).rejects.toThrow(
        'S3 upload failed with status: 403'
      );
    });
  });

  describe('importCsv', () => {
    it('should complete full CSV import flow', async () => {
      const mockFile = new File(['date,amount\n2024-01-01,1000'], 'test.csv', {
        type: 'text/csv',
      });
      const mockPresignedResponse = {
        uploadUrl: 'https://s3.amazonaws.com/bucket/key?signature=xyz',
        fileName: 'user-123/file-456.csv',
      };

      // Mock getPresignedUrl
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPresignedResponse,
      });

      // Mock uploadCsvToS3
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
      });

      const fileName = await importCsv(mockFile);

      expect(fileName).toBe('user-123/file-456.csv');
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should throw error when presigned URL request fails', async () => {
      const mockFile = new File(['date,amount\n2024-01-01,1000'], 'test.csv', {
        type: 'text/csv',
      });

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Unauthorized' }),
      });

      await expect(importCsv(mockFile)).rejects.toThrow('Unauthorized');
    });

    it('should throw error when S3 upload fails', async () => {
      const mockFile = new File(['date,amount\n2024-01-01,1000'], 'test.csv', {
        type: 'text/csv',
      });
      const mockPresignedResponse = {
        uploadUrl: 'https://s3.amazonaws.com/bucket/key?signature=xyz',
        fileName: 'user-123/file-456.csv',
      };

      // Mock successful getPresignedUrl
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPresignedResponse,
      });

      // Mock failed uploadCsvToS3
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(importCsv(mockFile)).rejects.toThrow('S3 upload failed');
    });
  });
});
