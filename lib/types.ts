export interface Account {
    _id: string;
    name: string;
    type: "bank" | "credit-card";
    balance: number;
    accountNumber?: string;
    creditLimit?: number;
    user: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Transaction {
    _id: string;
    amount: number; // Positive for credits, negative for debits
    type: "credit" | "debit";
    category: string;
    subCategory?: string;
    description: string;
    date: string;
    sourceAccount: string;
    billingCycle: string;
    user: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Budget {
    _id: string;
    category: string;
    allocated: number;
    spent: number;
    period: string;
    user: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface User {
    _id: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Category {
    _id: string;
    name: string;
    user: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface FinanceStore {
    accounts: Account[];
    transactions: Transaction[];
    budgets: Budget[];
    categories: string[];
    isLoading: boolean;
    error: string | null;
    
    initialize: () => Promise<void>;
    addTransaction: (transaction: Omit<Transaction, "_id" | "user" | "createdAt" | "updatedAt">) => Promise<void>;
    addAccount: (account: Omit<Account, "_id" | "user" | "createdAt" | "updatedAt">) => Promise<void>;
    addBudget: (budget: Omit<Budget, "_id" | "spent" | "user" | "createdAt" | "updatedAt">) => Promise<void>;
    addCategory: (category: string) => Promise<void>;
    updateAccount: (id: string, accountData: Partial<Account>) => Promise<void>;
    updateTransaction: (id: string, transactionData: Partial<Transaction>) => Promise<void>;
    deleteAccount: (id: string) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    deleteBudget: (id: string) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
    getCreditCardBill: (accountId: string, cycle: string) => Promise<number>;
    getBillingCycle: (dateString: string) => string;
  }
  
  // Dashboard data interfaces
  export interface DashboardData {
    summary: {
      totalIncome: number;
      totalExpenses: number;
      totalSavings: number;
      netWorth: {
        bank: number;
        creditCard: number;
        total: number;
      };
    };
    spendingByCategory: Array<{ category: string; amount: number }>;
    budgetVsActual: Array<{
      category: string;
      allocated: number;
      spent: number;
      remaining: number;
    }>;
    monthlySpendingTrend: Array<{ month: string; amount: number }>;
    incomeVsExpenses: Array<{ month: string; type: string; amount: number }>;
    accounts: Account[];
    topMerchants: Array<{ merchant: string; amount: number; count: number }>;
    transactionsByDayOfWeek: Array<{ day: string; amount: number; count: number }>;
    transactionCountByCategory: Array<{ category: string; count: number }>;
    creditCardUtilization: Array<{
      name: string;
      balance: number;
      limit: number;
      utilization: number;
    }>;
    cashFlowAnalysis: Array<{
      month: string;
      inflow: number;
      outflow: number;
      netFlow: number;
    }>;
  }