import { create } from "zustand";
import { nanoid } from "nanoid";
import api from "./api";
import { FinanceStore, Account, Transaction, Budget } from "./types";

export const useFinanceStore = create<FinanceStore>((set, get) => ({
  accounts: [],
  transactions: [],
  budgets: [],
  categories: [],
  isLoading: false,
  error: null,

  // Initialize the store by fetching data from the API
  initialize: async () => {
    set({ isLoading: true, error: null });
    try {
      // Check if user is authenticated
      if (!api.auth.isAuthenticated()) {
        set({ isLoading: false });
        return;
      }

      // Fetch all data in parallel
      const [accounts, transactions, budgets, categories] = await Promise.all([
        api.accounts.getAll(),
        api.transactions.getAll(),
        api.budgets.getAll(),
        api.categories.getAll(),
      ]);

      set({
        accounts,
        transactions,
        budgets,
        categories,
        isLoading: false,
      });
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.message || "Failed to initialize store" 
      });
      console.error("Store initialization error:", error);
    }
  },

  // Get credit card bill for a specific account and billing cycle
  getCreditCardBill: async (accountId: string, cycle: string) => {
    try {
      const bill = await api.accounts.getCreditCardBill(accountId, cycle);
      return bill.totalBill;
    } catch (error) {
      console.error("Error fetching credit card bill:", error);
      return 0;
    }
  },
   // Add a category to the database
   addCategory: async (category: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.categories.create(category);
      // Refresh categories
      const categories = await api.categories.getAll();
      set({
        categories,
        isLoading: false,
      });
      return categories;
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.message || "Failed to add category" 
      });
      console.error("Add category error:", error);
      throw error;
    }
  },

  // Get billing cycle for a specific date
  getBillingCycle: (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + (date.getDate() > 15 ? 1 : 0);
    const year = date.getFullYear() + (month > 11 ? 1 : 0);
    return `${new Date(year, month % 12).toLocaleString("default", {
      month: "short",
    })} ${year}`;
  },

  // Add a transaction and update related data
  addTransaction: async (transaction: Omit<Transaction, "id">) => {
    set({ isLoading: true, error: null });
    try {
      // Calculate amount based on transaction type
      const amount = transaction.type === "credit" 
        ? Math.abs(transaction.amount) 
        : -Math.abs(transaction.amount);

      // Create the transaction in the database
      const newTransaction = await api.transactions.create({
        ...transaction,
        amount,
      });

      // Fetch updated accounts and budgets
      const [accounts, budgets] = await Promise.all([
        api.accounts.getAll(),
        api.budgets.getAll(),
      ]);

      // Update state with the new data
      set((state) => ({
        transactions: [...state.transactions, newTransaction],
        accounts,
        budgets,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.message || "Failed to add transaction" 
      });
      console.error("Add transaction error:", error);
    }
  },

  // Add an account to the database
  addAccount: async (account: Omit<Account, "id">) => {
    set({ isLoading: true, error: null });
    try {
      const newAccount = await api.accounts.create(account);
      set((state) => ({
        accounts: [...state.accounts, newAccount],
        isLoading: false,
      }));
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.message || "Failed to add account" 
      });
      console.error("Add account error:", error);
    }
  },

  // Add a budget to the database
  addBudget: async (budget: Omit<Budget, "id" | "spent">) => {
    set({ isLoading: true, error: null });
    try {
      const newBudget = await api.budgets.create(budget);
      set((state) => ({
        budgets: [...state.budgets, newBudget],
        isLoading: false,
      }));
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.message || "Failed to add budget" 
      });
      console.error("Add budget error:", error);
    }
  },

  // Add a category to the database
  addCategory: async (category: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.categories.create(category);
      // Refresh categories
      const categories = await api.categories.getAll();
      set((state) => ({
        categories,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.message || "Failed to add category" 
      });
      console.error("Add category error:", error);
    }
  },

  // Update an account in the database
  updateAccount: async (id: string, accountData: Partial<Account>) => {
    set({ isLoading: true, error: null });
    try {
      await api.accounts.update(id, accountData);
      const accounts = await api.accounts.getAll();
      set({ accounts, isLoading: false });
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.message || "Failed to update account" 
      });
      console.error("Update account error:", error);
    }
  },

  // Update a transaction in the database
  updateTransaction: async (id: string, transactionData: Partial<Transaction>) => {
    set({ isLoading: true, error: null });
    try {
      await api.transactions.update(id, transactionData);
      // Fetch all updated data
      const [transactions, accounts, budgets] = await Promise.all([
        api.transactions.getAll(),
        api.accounts.getAll(),
        api.budgets.getAll(),
      ]);
      set({ transactions, accounts, budgets, isLoading: false });
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.message || "Failed to update transaction" 
      });
      console.error("Update transaction error:", error);
    }
  },

  // Delete an account from the database
  deleteAccount: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.accounts.delete(id);
      const accounts = await api.accounts.getAll();
      set({ accounts, isLoading: false });
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.message || "Failed to delete account" 
      });
      console.error("Delete account error:", error);
    }
  },

  // Delete a transaction from the database
  deleteTransaction: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.transactions.delete(id);
      // Fetch all updated data
      const [transactions, accounts, budgets] = await Promise.all([
        api.transactions.getAll(),
        api.accounts.getAll(),
        api.budgets.getAll(),
      ]);
      set({ transactions, accounts, budgets, isLoading: false });
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.message || "Failed to delete transaction" 
      });
      console.error("Delete transaction error:", error);
    }
  },

  // Delete a budget from the database
  deleteBudget: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.budgets.delete(id);
      const budgets = await api.budgets.getAll();
      set({ budgets, isLoading: false });
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.message || "Failed to delete budget" 
      });
      console.error("Delete budget error:", error);
    }
  },

  // Delete a category from the database
  deleteCategory: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.categories.delete(id);
      const categories = await api.categories.getAll();
      set({ categories, isLoading: false });
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.message || "Failed to delete category" 
      });
      console.error("Delete category error:", error);
    }
  },
}));