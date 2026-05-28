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
 * Mock mode flag
 */
const MOCK_MODE = import.meta.env.VITE_MOCK_AUTH === 'true';

/**
 * Mock transactions data
 */
let mockTransactions: Transaction[] = [
  {
    id: 'mock-1',
    userId: 'mock-user-123',
    date: '2026-05-01',
    category: '給料',
    amount: 300000,
    incomeExpense: 'INCOME',
    memo: '5月の給料',
    createdAt: '2026-05-01T00:00:00Z',
    updatedAt: '2026-05-01T00:00:00Z',
  },
  {
    id: 'mock-2',
    userId: 'mock-user-123',
    date: '2026-05-05',
    category: '食費',
    amount: 5000,
    incomeExpense: 'EXPENSE',
    memo: 'スーパーで買い物',
    createdAt: '2026-05-05T00:00:00Z',
    updatedAt: '2026-05-05T00:00:00Z',
  },
  {
    id: 'mock-3',
    userId: 'mock-user-123',
    date: '2026-05-10',
    category: '交通費',
    amount: 3000,
    incomeExpense: 'EXPENSE',
    memo: '電車代',
    createdAt: '2026-05-10T00:00:00Z',
    updatedAt: '2026-05-10T00:00:00Z',
  },
  {
    id: 'mock-4',
    userId: 'mock-user-123',
    date: '2026-05-15',
    category: '娯楽',
    amount: 8000,
    incomeExpense: 'EXPENSE',
    memo: '映画とディナー',
    createdAt: '2026-05-15T00:00:00Z',
    updatedAt: '2026-05-15T00:00:00Z',
  },
  {
    id: 'mock-5',
    userId: 'mock-user-123',
    date: '2026-05-20',
    category: '光熱費',
    amount: 12000,
    incomeExpense: 'EXPENSE',
    memo: '電気・ガス・水道',
    createdAt: '2026-05-20T00:00:00Z',
    updatedAt: '2026-05-20T00:00:00Z',
  },
];

/**
 * Get ID token from local storage
 */
function getIdToken(): string {
  const idToken = localStorage.getItem('kakei_id_token');
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
    // 🔧 MOCK MODE
    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      let filtered = [...mockTransactions];
      
      // Apply filters
      if (params.startDate) {
        filtered = filtered.filter((t) => t.date >= params.startDate!);
      }
      if (params.endDate) {
        filtered = filtered.filter((t) => t.date <= params.endDate!);
      }
      if (params.category) {
        filtered = filtered.filter((t) => t.category === params.category);
      }
      if (params.incomeExpense) {
        filtered = filtered.filter((t) => t.incomeExpense === params.incomeExpense);
      }
      
      return { items: filtered };
    }
    
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
    // 🔧 MOCK MODE
    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const newTransaction: Transaction = {
        id: `mock-${Date.now()}`,
        userId: 'mock-user-123',
        ...transaction,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      mockTransactions.push(newTransaction);
      return newTransaction;
    }
    
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
    // 🔧 MOCK MODE
    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const index = mockTransactions.findIndex((t) => t.id === id);
      if (index === -1) {
        throw new Error('Transaction not found');
      }
      
      mockTransactions[index] = {
        ...mockTransactions[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      
      return mockTransactions[index];
    }
    
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
    // 🔧 MOCK MODE
    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const index = mockTransactions.findIndex((t) => t.id === id);
      if (index === -1) {
        throw new Error('Transaction not found');
      }
      
      mockTransactions.splice(index, 1);
      return;
    }
    
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
