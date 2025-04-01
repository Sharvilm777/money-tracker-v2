"use client";

import { useState, useEffect } from "react";
import {
  ArrowDown,
  ArrowUp,
  IndianRupee,
  Filter,
  CreditCard,
  Banknote,
  FileText,
  AlertCircle,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useFinanceStore } from "@/lib/store";
import { cn, formatCurrency, getBillingCycle, formatDate } from "@/lib/utils";
import EmptyState from "@/components/EmptyState";

export default function TransactionsPage() {
  const { 
    accounts, 
    categories, 
    transactions, 
    addTransaction,
    deleteTransaction,
    initialize,
    isLoading,
    error 
  } = useFinanceStore();
  
  const [filters, setFilters] = useState({
    type: "all",
    category: "all",
    source: "all",
    minAmount: "",
    maxAmount: "",
    dateFrom: "",
    dateTo: "",
    searchText: "",
  });

  const [newTransaction, setNewTransaction] = useState({
    amount: "",
    type: "debit",
    category: "",
    subCategory: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    sourceAccount: "",
  });

  // Add category state
  const [newCategory, setNewCategory] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);

  // Initialize store when component mounts
  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleAddCategory = async () => {
    if (newCategory) {
      await addCategory(newCategory);
      setNewCategory("");
      setShowAddCategory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(newTransaction.amount);
    
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid positive amount");
      return;
    }

    if (!newTransaction.sourceAccount) {
      alert("Please select an account");
      return;
    }

    if (!newTransaction.category) {
      alert("Please select a category");
      return;
    }

    await addTransaction({
      amount: newTransaction.type === "credit" ? amount : amount,
      type: newTransaction.type,
      category: newTransaction.category,
      subCategory: newTransaction.subCategory,
      description: newTransaction.description || newTransaction.category,
      date: newTransaction.date,
      sourceAccount: newTransaction.sourceAccount,
      billingCycle: getBillingCycle(newTransaction.date),
    });

    setNewTransaction({
      amount: "",
      type: "debit",
      category: "",
      subCategory: "",
      description: "",
      date: new Date().toISOString().split('T')[0],
      sourceAccount: "",
    });
  };

  // Apply filters to transactions
  const filteredTransactions = transactions.filter((transaction) => {
    // Type filter (credit/debit)
    if (filters.type !== "all" && transaction.type !== filters.type) {
      return false;
    }
    
    // Category filter
    if (filters.category !== "all" && transaction.category !== filters.category) {
      return false;
    }
    
    // Source account filter
    if (filters.source !== "all" && transaction.sourceAccount !== filters.source) {
      return false;
    }
    
    // Amount filters
    const amount = Math.abs(transaction.amount);
    if (filters.minAmount && amount < parseFloat(filters.minAmount)) {
      return false;
    }
    if (filters.maxAmount && amount > parseFloat(filters.maxAmount)) {
      return false;
    }
    
    // Date filters
    const transactionDate = new Date(transaction.date);
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      if (transactionDate < fromDate) {
        return false;
      }
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      if (transactionDate > toDate) {
        return false;
      }
    }
    
    // Search text in description or category
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      const descriptionMatch = transaction.description.toLowerCase().includes(searchLower);
      const categoryMatch = transaction.category.toLowerCase().includes(searchLower);
      if (!descriptionMatch && !categoryMatch) {
        return false;
      }
    }
    
    return true;
  });

  // Sort by date (newest first)
  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Check if we can add transactions (need accounts and categories)
  const canAddTransactions = accounts.length > 0 && categories.length > 0;

  if (isLoading && accounts.length === 0 && categories.length === 0) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Transactions</h1>

      {error && (
        <Alert variant="destructive" className="mb-4 md:mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Transaction Form */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <Card>
            <CardHeader className="pb-2 md:pb-4">
              <CardTitle className="text-lg md:text-xl">New Transaction</CardTitle>
            </CardHeader>
            <CardContent>
              {!canAddTransactions ? (
                <div className="text-center space-y-4 py-4">
                  {accounts.length === 0 && (
                    <div>
                     <p className="mb-2 text-muted-foreground">You need to add an account first</p>
                      <Button asChild className="w-full">
                        <a href="/accounts">Add Account</a>
                      </Button>
                    </div>
                  )}
                  
                  {accounts.length > 0 && categories.length === 0 && (
                    <div>
                      <p className="mb-2 text-muted-foreground">You need to add categories first</p>
                      <Button asChild className="w-full">
                        <a href="/budgets">Add Categories</a>
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      value={newTransaction.type}
                      onValueChange={(value) =>
                        setNewTransaction({ ...newTransaction, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Transaction Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="debit">Expense</SelectItem>
                        <SelectItem value="credit">Income</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Amount"
                      value={newTransaction.amount}
                      onChange={(e) =>
                        setNewTransaction({
                          ...newTransaction,
                          amount: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Select
                        value={newTransaction.category}
                        onValueChange={(value) =>
                          setNewTransaction({ ...newTransaction, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="icon"
                      onClick={() => setShowAddCategory(true)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {showAddCategory && (
                    <div className="space-y-2 p-3 border rounded-md bg-muted/50">
                      <Input
                        placeholder="New Category Name"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button 
                          type="button"
                          onClick={handleAddCategory} 
                          size="sm"
                          className="flex-1"
                        >
                          Add
                        </Button>
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowAddCategory(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  <Input
                    placeholder="Sub Category (Optional)"
                    value={newTransaction.subCategory}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        subCategory: e.target.value,
                      })
                    }
                  />

                  <Input
                    placeholder="Description"
                    value={newTransaction.description}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        description: e.target.value,
                      })
                    }
                  />

                  <Select
                    value={newTransaction.sourceAccount}
                    onValueChange={(value) =>
                      setNewTransaction({
                        ...newTransaction,
                        sourceAccount: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account._id} value={account._id}>
                          {account.name} ({account.type === "bank" ? "Bank" : "Credit Card"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        date: e.target.value,
                      })
                    }
                    required
                  />

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Adding..." : "Add Transaction"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4 md:space-y-6 order-1 lg:order-2">
          <Card>
            <CardHeader className="pb-2 md:pb-4">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Filter className="w-4 h-4 md:w-5 md:h-5" /> Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              <Select
                value={filters.type}
                onValueChange={(value) =>
                  setFilters({ ...filters, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="credit">Income</SelectItem>
                  <SelectItem value="debit">Expenses</SelectItem>
                </SelectContent>
              </Select>

              {categories.length > 0 && (
                <Select
                  value={filters.category}
                  onValueChange={(value) =>
                    setFilters({ ...filters, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {accounts.length > 0 && (
                <Select
                  value={filters.source}
                  onValueChange={(value) =>
                    setFilters({ ...filters, source: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Accounts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Accounts</SelectItem>
                    {accounts.map((account) => (
                      <SelectItem key={account._id} value={account._id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Input
                placeholder="Search description..."
                value={filters.searchText}
                onChange={(e) =>
                  setFilters({ ...filters, searchText: e.target.value })
                }
              />

              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  placeholder="From Date"
                  value={filters.dateFrom}
                  onChange={(e) =>
                    setFilters({ ...filters, dateFrom: e.target.value })
                  }
                />
                <Input
                  type="date"
                  placeholder="To Date"
                  value={filters.dateTo}
                  onChange={(e) =>
                    setFilters({ ...filters, dateTo: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min Amount"
                  value={filters.minAmount}
                  onChange={(e) =>
                    setFilters({ ...filters, minAmount: e.target.value })
                  }
                />
                <Input
                  type="number"
                  placeholder="Max Amount"
                  value={filters.maxAmount}
                  onChange={(e) =>
                    setFilters({ ...filters, maxAmount: e.target.value })
                  }
                />
              </div>

              <Button 
                variant="outline"
                onClick={() => setFilters({
                  type: "all",
                  category: "all",
                  source: "all",
                  minAmount: "",
                  maxAmount: "",
                  dateFrom: "",
                  dateTo: "",
                  searchText: "",
                })}
                className="md:col-span-3"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {transactions.length === 0 ? (
                <EmptyState
                  title="No Transactions Yet"
                  description="Start tracking your income and expenses by adding your first transaction."
                  icon={<FileText className="h-8 w-8 text-primary" />}
                  actionLabel="Add Your First Transaction"
                  actionLink="#"
                />
              ) : sortedTransactions.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No transactions match your filters
                </div>
              ) : (
                sortedTransactions.map((transaction) => {
                  const isCredit = transaction.type === "credit";
                  const sourceAccount = accounts.find(
                    (a) => a._id === transaction.sourceAccount
                  );
                  const amount = Math.abs(transaction.amount);

                  return (
                    <div
                      key={transaction._id}
                      className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors border"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "p-2 rounded-full",
                            isCredit
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          )}
                        >
                          {isCredit ? (
                            <ArrowUp className="w-5 h-5" />
                          ) : (
                            <ArrowDown className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">{transaction.category}</h3>
                          <p className="text-sm text-muted-foreground">
                            {transaction.description}
                            {sourceAccount && (
                              <span className="ml-2">
                                ({sourceAccount.name} -{" "}
                                {sourceAccount.type === "credit-card"
                                  ? `Billing: ${transaction.billingCycle}`
                                  : "Bank"}
                                )
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={cn(
                            "font-medium flex items-center gap-1 justify-end",
                            isCredit ? "text-green-600" : "text-red-600"
                          )}
                        >
                          {formatCurrency(amount)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(transaction.date, "medium")}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}