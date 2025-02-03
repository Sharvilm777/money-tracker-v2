import { create } from "zustand";
import { nanoid } from "nanoid";

interface Account {
  id: string;
  name: string;
  type: "bank" | "credit-card";
  balance: number;
  accountNumber?: string;
  creditLimit?: number;
}

interface Transaction {
  id: string;
  amount: number; // Positive for credits, negative for debits
  type: "credit" | "debit";
  category: string;
  subCategory?: string;
  description: string;
  date: string;
  sourceAccount: string;
  billingCycle: string;
}

interface Budget {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  period: string;
}

interface FinanceStore {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  categories: string[];
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  addAccount: (account: Omit<Account, "id">) => void;
  addBudget: (budget: Omit<Budget, "id" | "spent">) => void;
  addCategory: (category: string) => void;
  getCreditCardBill: (accountId: string, cycle: string) => number;
}

export const useFinanceStore = create<FinanceStore>((set, get) => ({
  accounts: [],
  transactions: [],
  budgets: [],
  categories: [
    "Groceries",
    "Utilities",
    "Entertainment",
    "Transport",
    "Credit",
  ],

  getCreditCardBill: (accountId, cycle) => {
    return get()
      .transactions.filter(
        (t) => t.sourceAccount === accountId && t.billingCycle === cycle
      )
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  },
  getBillingCycle: (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + (date.getDate() > 15 ? 1 : 0);
    const year = date.getFullYear() + (month > 11 ? 1 : 0);
    return `${new Date(year, month % 12).toLocaleString("default", {
      month: "short",
    })} ${year}`;
  },
  addTransaction: (transaction) =>
    set((state) => {
      const amount =
        transaction.type === "credit"
          ? transaction.amount
          : -transaction.amount;
      const isCreditCard =
        state.accounts.find((a) => a.id === transaction.sourceAccount)?.type ===
        "credit-card";

      // Update account balance
      const updatedAccounts = state.accounts.map((account) => {
        if (account.id === transaction.sourceAccount) {
          const newBalance = isCreditCard
            ? account.balance + amount // Credit cards: credit reduces balance, debit increases
            : account.balance +
              (transaction.type === "credit" ? amount : -amount);
          return { ...account, balance: newBalance };
        }
        return account;
      });

      // Update budget for debits
      const updatedBudgets =
        transaction.type === "debit"
          ? state.budgets.map((budget) => {
              if (budget.category === transaction.category) {
                return { ...budget, spent: budget.spent + Math.abs(amount) };
              }
              return budget;
            })
          : state.budgets;

      return {
        accounts: updatedAccounts,
        budgets: updatedBudgets,
        transactions: [
          ...state.transactions,
          {
            ...transaction,
            id: nanoid(),
            amount,
          },
        ],
      };
    }),

  addAccount: (account) =>
    set((state) => ({
      accounts: [...state.accounts, { ...account, id: nanoid() }],
    })),

  addBudget: (budget) =>
    set((state) => ({
      budgets: [...state.budgets, { ...budget, id: nanoid(), spent: 0 }],
    })),

  addCategory: (category) =>
    set((state) => ({
      categories: [...state.categories, category],
    })),
}));
