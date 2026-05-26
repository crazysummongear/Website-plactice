/**
 * CSV Import API Client
 * Handles CSV file upload to S3 via presigned URLs
 */

/**
 * Presigned URL response from backend
 */
export interface PresignedUrlResponse {
  uploadUrl: string;
  fileName: string;
}

/**
 * API Gateway base URL
 * TODO: Move to environment variables
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://your-api-gateway-url.execute-api.ap-northeast-1.amazonaws.com/prod';

/**
 * Get ID token from local storage
 */
function getIdToken(): string {
  const idToken = localStorage.getItem('idToken');
  if (!idToken) {
    throw new Error('Not authenticated');
  }
  return idToken;
}

/**
 * Get presigned URL for CSV upload
 * Calls POST /csv/upload-url endpoint
 * @returns Presigned URL and file name
 */
export async function getPresignedUrl(): Promise<PresignedUrlResponse> {
  try {
    const idToken = getIdToken();
    
    const response = await fetch(`${API_BASE_URL}/csv/upload-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get presigned URL');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Get presigned URL failed: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Upload CSV file to S3 using presigned URL
 * @param file - CSV file to upload
 * @param uploadUrl - Presigned URL from getPresignedUrl()
 */
export async function uploadCsvToS3(file: File, uploadUrl: string): Promise<void> {
  try {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'text/csv',
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error(`S3 upload failed with status: ${response.status}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Upload CSV to S3 failed: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Complete CSV import flow
 * 1. Get presigned URL from backend
 * 2. Upload CSV file to S3
 * @param file - CSV file to upload
 * @returns File name in S3
 */
export async function importCsv(file: File): Promise<string> {
  try {
    // Step 1: Get presigned URL
    const { uploadUrl, fileName } = await getPresignedUrl();
    
    // Step 2: Upload file to S3
    await uploadCsvToS3(file, uploadUrl);
    
    return fileName;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`CSV import failed: ${error.message}`);
    }
    throw error;
  }
}
