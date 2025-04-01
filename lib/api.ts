import { Account, Transaction, Budget } from './types';
import Cookies from 'js-cookie';

// Base API URL - adjust this based on your deployment environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

const TOKEN_COOKIE_NAME = 'finance_auth_token';

// Helper function to get the authentication token from cookies
const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    
    const token = Cookies.get(TOKEN_COOKIE_NAME);
    console.log('Retrieved token from cookies:', token ? 'Token exists' : 'No token found');
    return token || null;
  }
  return null;
};
// HTTP request helper with authentication
// HTTP request helper with authentication
const apiRequest = async (
    endpoint: string,
    method: string = 'GET',
    data?: any
  ): Promise<any> => {
    const token = getToken();

    console.log("Getting authToken",token)
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
  
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log(`API Request to ${endpoint} with token:`, token.substring(0, 15) + '...');
    } else {
      console.warn(`No auth token available for request to: ${endpoint}`);
    }
  
    const config: RequestInit = {
      method,
      headers,
      credentials: 'include', // Include cookies in requests
    };

  
    if (data) {
      config.body = JSON.stringify(data);
    }
  console.log("this are the config",config);
  
    try {
      const response = await fetch(`${API_BASE_URL}/api${endpoint}`, config);
  
      // Handle 401 errors without immediately redirecting
      if (response.status === 401) {
        console.error(`Authentication error (401) on ${endpoint}`);
        
        // Only throw an error, don't redirect here
        return { 
          error: 'Authentication failed. Please try logging in again.',
          status: 401
        };
      }
  
      // Parse the JSON response
      const result = await response.json();
  
      // Handle error responses
      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong');
      }
  
      return result;
    } catch (error: any) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  };

// Authentication API
export const authAPI = {
    register: async (userData: { name: string; email: string; password: string }) => {
        const response = await apiRequest('/users', 'POST', userData);
        console.log('Register API response:', response);
        
        // Store token in cookie if present in response
        if (response && response.token) {
          Cookies.set(TOKEN_COOKIE_NAME, response.token, { 
            expires: 30, // 30 days
            secure: window.location.protocol === 'https:',
            sameSite: 'strict'
          });
          console.log('Token stored in cookie from register API:', response.token);
        }
        
        return response;
      },
    
      login: async (credentials: { email: string; password: string }) => {
        const response = await apiRequest('/users/login', 'POST', credentials);
        console.log('Login API response:', response);
        
        // Store token in cookie if present in response
        if (response && response.token) {
          Cookies.set(TOKEN_COOKIE_NAME, response.token, { 
            expires: 30, // 30 days
            secure: window.location.protocol === 'https:',
            sameSite: 'strict'
          });
          console.log('Token stored in cookie from login API:', response.token);
        }
        
        return response;
      },
    
      logout: () => {
        Cookies.remove(TOKEN_COOKIE_NAME);
        window.location.href = '/login';
      },

  getProfile: async () => {
    const token = getToken();
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return apiRequest(`/users/${payload.id}`, 'GET');
    } catch (error) {
      console.error('Error parsing token:', error);
      localStorage.removeItem('token');
      return null;
    }
  },

  isAuthenticated: () => {
    try {
      const token = getToken();
      console.log('Checking authentication, token:', token ? 'Token exists' : 'No token found');
      
      if (!token) return false;
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Token payload:', payload);
      
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const isValid = Date.now() < expirationTime;
      
      console.log('Token valid:', isValid, 'Expires:', new Date(expirationTime).toLocaleString());
      
      // If token is expired, remove it
      if (!isValid) {
        Cookies.remove(TOKEN_COOKIE_NAME);
        console.log('Removed expired token from cookies');
      }
      
      return isValid;
    } catch (error) {
      console.error('Error validating token:', error);
      // If there's any error parsing the token, consider user not authenticated
      Cookies.remove(TOKEN_COOKIE_NAME); // Clean up potentially bad token
      return false;
    }
  }
};

// Accounts API
export const accountsAPI = {
  getAll: async (): Promise<Account[]> => {
    return apiRequest('/accounts');
  },

  getById: async (id: string): Promise<Account> => {
    return apiRequest(`/accounts/${id}`);
  },

  create: async (accountData: Omit<Account, 'id'>): Promise<Account> => {
    return apiRequest('/accounts', 'POST', accountData);
  },

  update: async (id: string, accountData: Partial<Account>): Promise<Account> => {
    return apiRequest(`/accounts/${id}`, 'PUT', accountData);
  },

  delete: async (id: string): Promise<void> => {
    return apiRequest(`/accounts/${id}`, 'DELETE');
  },

  getCreditCardBill: async (accountId: string, cycle: string): Promise<any> => {
    return apiRequest(`/accounts/${accountId}/bill/${cycle}`);
  }
};

// Transactions API
export const transactionsAPI = {
  getAll: async (filters: any = {}): Promise<Transaction[]> => {
    // Convert filters to query string
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value as string);
      }
    });
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiRequest(`/transactions${queryString}`);
  },

  getById: async (id: string): Promise<Transaction> => {
    return apiRequest(`/transactions/${id}`);
  },

  create: async (transactionData: Omit<Transaction, 'id'>): Promise<Transaction> => {
    return apiRequest('/transactions', 'POST', transactionData);
  },

  update: async (id: string, transactionData: Partial<Transaction>): Promise<Transaction> => {
    return apiRequest(`/transactions/${id}`, 'PUT', transactionData);
  },

  delete: async (id: string): Promise<void> => {
    return apiRequest(`/transactions/${id}`, 'DELETE');
  }
};

// Budgets API
export const budgetsAPI = {
  getAll: async (filters: any = {}): Promise<Budget[]> => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value as string);
      }
    });
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiRequest(`/budgets${queryString}`);
  },

  getById: async (id: string): Promise<Budget> => {
    return apiRequest(`/budgets/${id}`);
  },

  create: async (budgetData: Omit<Budget, 'id' | 'spent'>): Promise<Budget> => {
    return apiRequest('/budgets', 'POST', budgetData);
  },

  update: async (id: string, budgetData: Partial<Budget>): Promise<Budget> => {
    return apiRequest(`/budgets/${id}`, 'PUT', budgetData);
  },

  delete: async (id: string): Promise<void> => {
    return apiRequest(`/budgets/${id}`, 'DELETE');
  }
};

// Categories API
export const categoriesAPI = {
  getAll: async (): Promise<string[]> => {
    const categories = await apiRequest('/categories');
    return categories.map((cat: any) => cat.name);
  },

  create: async (name: string): Promise<any> => {
    return apiRequest('/categories', 'POST', { name });
  },

  update: async (id: string, name: string): Promise<any> => {
    return apiRequest(`/categories/${id}`, 'PUT', { name });
  },

  delete: async (id: string): Promise<void> => {
    return apiRequest(`/categories/${id}`, 'DELETE');
  }
};

// Dashboard API
export const dashboardAPI = {
  getData: async (period: string = 'current-month'): Promise<any> => {
    return apiRequest(`/dashboard?period=${period}`);
  }
};

// Export all APIs as a single object
const api = {
  auth: authAPI,
  accounts: accountsAPI,
  transactions: transactionsAPI,
  budgets: budgetsAPI,
  categories: categoriesAPI,
  dashboard: dashboardAPI,
};

export default api;