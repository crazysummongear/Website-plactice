/**
 * Transaction API Client
 * Handles all transaction-related API calls to the backend
 */

/**
 * Transaction type definition
 */
export interface Transaction {
  id: string;
  userId: string;
  date: string; // ISO 8601 format (YYYY-MM-DD)
  category: string;
  amount: number;
  incomeExpense: 'INCOME' | 'EXPENSE';
  memo?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Transaction creation request
 */
export interface CreateTransactionRequest {
  date: string;
  category: string;
  amount: number;
  incomeExpense: 'INCOME' | 'EXPENSE';
  memo?: string;
}

/**
 * Transaction update request
 */
export interface UpdateTransactionRequest {
  category?: string;
  amount?: number;
  incomeExpense?: 'INCOME' | 'EXPENSE';
  memo?: string;
}

/**
 * Transaction query parameters
 */
export interface TransactionQueryParams {
  startDate?: string;
  endDate?: string;
  category?: string;
  incomeExpense?: 'INCOME' | 'EXPENSE';
}

/**
 * Transaction list response
 */
export interface TransactionListResponse {
  items: Transaction[];
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
 * Build query string from parameters
 */
function buildQueryString(params: TransactionQueryParams): string {
  const searchParams = new URLSearchParams();
  
  if (params.startDate) searchParams.append('startDate', params.startDate);
  if (params.endDate) searchParams.append('endDate', params.endDate);
  if (params.category) searchParams.append('category', params.category);
  if (params.incomeExpense) searchParams.append('incomeExpense', params.incomeExpense);
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Get transactions with optional filters
 * @param params - Query parameters for filtering
 * @returns List of transactions
 */
export async function getTransactions(
  params: TransactionQueryParams = {}
): Promise<TransactionListResponse> {
  try {
    const idToken = getIdToken();
    const queryString = buildQueryString(params);
    
    const response = await fetch(`${API_BASE_URL}/transactions${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch transactions');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Get transactions failed: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Create a new transaction
 * @param transaction - Transaction data
 * @returns Created transaction
 */
export async function createTransaction(
  transaction: CreateTransactionRequest
): Promise<Transaction> {
  try {
    const idToken = getIdToken();
    
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify(transaction),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create transaction');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Create transaction failed: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Update an existing transaction
 * @param id - Transaction ID
 * @param updates - Fields to update
 * @returns Updated transaction
 */
export async function updateTransaction(
  id: string,
  updates: UpdateTransactionRequest
): Promise<Transaction> {
  try {
    const idToken = getIdToken();
    
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update transaction');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Update transaction failed: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Delete a transaction
 * @param id - Transaction ID
 */
export async function deleteTransaction(id: string): Promise<void> {
  try {
    const idToken = getIdToken();
    
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete transaction');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Delete transaction failed: ${error.message}`);
    }
    throw error;
  }
}
