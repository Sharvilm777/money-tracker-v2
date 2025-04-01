"use client";

import { useEffect, useState } from "react";
import {
  Banknote,
  CreditCard,
  Clock,
  TrendingUp,
  Plus,
  IndianRupee,
  AlertCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/Progress"; // Corrected import path
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCurrency } from "@/lib/utils";
import { useFinanceStore } from "@/lib/store";
import EmptyState from "@/components/EmptyState";

export default function Home() {
  const { transactions, budgets, accounts, addAccount, initialize, isLoading, error } = useFinanceStore();
  const [newAccount, setNewAccount] = useState({
    name: "",
    type: "bank",
    balance: "",
    accountNumber: "",
    creditLimit: "",
  });
  const [showAccountForm, setShowAccountForm] = useState(false);

  // Initialize the store when the component mounts
  useEffect(() => {
    const initializeStore = async () => {
      await initialize();
    };
    
    initializeStore();
  }, [initialize]);

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await addAccount({
      name: newAccount.name,
      type: newAccount.type as "bank" | "credit-card",
      balance: parseFloat(newAccount.balance),
      accountNumber: newAccount.accountNumber || undefined,
      creditLimit: newAccount.creditLimit
        ? parseFloat(newAccount.creditLimit)
        : undefined,
    });
    
    setNewAccount({
      name: "",
      type: "bank",
      balance: "",
      accountNumber: "",
      creditLimit: "",
    });
    
    setShowAccountForm(false);
  };

  // Check if user has any data yet
  const hasAccounts = accounts.length > 0;
  const hasTransactions = transactions.length > 0;
  const hasBudgets = budgets.length > 0;

  // Calculate totals
  const totalBankBalance = accounts
    .filter((a) => a.type === "bank")
    .reduce((sum, acc) => sum + acc.balance, 0);

  const totalCreditBalance = accounts
    .filter((a) => a.type === "credit-card")
    .reduce((sum, acc) => sum + acc.balance, 0);

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Show loading spinner while data is being loaded
  if (isLoading && !hasAccounts) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // First-time user experience
  if (!hasAccounts) {
    return (
      <div className="container mx-auto px-4 py-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8">Welcome to FinTrack!</h1>
        
        <div className="bg-blue-50 p-4 md:p-6 rounded-lg mb-6 md:mb-8 border border-blue-200">
          <h2 className="text-lg md:text-xl font-semibold text-blue-800 mb-2">🎉 Let's Get Started</h2>
          <p className="text-blue-700 mb-4">
            Thank you for using FinTrack! To begin tracking your finances, you'll need to add your accounts.
          </p>
          <ul className="list-disc list-inside text-blue-700 mb-4 space-y-1">
            <li>Start by adding a bank account or credit card</li>
            <li>Then set up your budget categories</li>
            <li>Finally, record your income and expenses</li>
          </ul>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Set Up Your First Account</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="bank" className="w-full">
              <TabsList className="grid grid-cols-2 w-[300px] mb-4">
                <TabsTrigger
                  value="bank"
                  onClick={() =>
                    setNewAccount({ ...newAccount, type: "bank" })
                  }
                >
                  Bank Account
                </TabsTrigger>
                <TabsTrigger
                  value="credit"
                  onClick={() =>
                    setNewAccount({ ...newAccount, type: "credit-card" })
                  }
                >
                  Credit Card
                </TabsTrigger>
              </TabsList>

              <TabsContent value="bank">
                <form onSubmit={handleAddAccount} className="space-y-4">
                  <Input
                    placeholder="Account Name"
                    value={newAccount.name}
                    onChange={(e) =>
                      setNewAccount({ ...newAccount, name: e.target.value })
                    }
                    required
                  />
                  <Input
                    placeholder="Account Number"
                    value={newAccount.accountNumber}
                    onChange={(e) =>
                      setNewAccount({
                        ...newAccount,
                        accountNumber: e.target.value,
                      })
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Current Balance"
                    value={newAccount.balance}
                    onChange={(e) =>
                      setNewAccount({
                        ...newAccount,
                        balance: e.target.value,
                      })
                    }
                    required
                  />
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? "Adding..." : "Add Bank Account"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="credit">
                <form onSubmit={handleAddAccount} className="space-y-4">
                  <Input
                    placeholder="Card Name"
                    value={newAccount.name}
                    onChange={(e) =>
                      setNewAccount({ ...newAccount, name: e.target.value })
                    }
                    required
                  />
                  <Input
                    type="number"
                    placeholder="Current Balance"
                    value={newAccount.balance}
                    onChange={(e) =>
                      setNewAccount({
                        ...newAccount,
                        balance: e.target.value,
                      })
                    }
                    required
                  />
                  <Input
                    type="number"
                    placeholder="Credit Limit"
                    value={newAccount.creditLimit}
                    onChange={(e) =>
                      setNewAccount({
                        ...newAccount,
                        creditLimit: e.target.value,
                      })
                    }
                  />
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? "Adding..." : "Add Credit Card"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
        <div className="container mx-auto px-4 py-4 md:p-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8">Financial Overview</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Add Account Section */}
      <div className="mb-8">
        {!showAccountForm ? (
          <Button onClick={() => setShowAccountForm(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add New Account/Card
          </Button>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Add New Financial Account</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="bank" className="w-full">
                <TabsList className="grid grid-cols-2 w-[300px] mb-4">
                  <TabsTrigger
                    value="bank"
                    onClick={() =>
                      setNewAccount({ ...newAccount, type: "bank" })
                    }
                  >
                    Bank Account
                  </TabsTrigger>
                  <TabsTrigger
                    value="credit"
                    onClick={() =>
                      setNewAccount({ ...newAccount, type: "credit-card" })
                    }
                  >
                    Credit Card
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="bank">
                  <form onSubmit={handleAddAccount} className="space-y-4">
                    <Input
                      placeholder="Account Name"
                      value={newAccount.name}
                      onChange={(e) =>
                        setNewAccount({ ...newAccount, name: e.target.value })
                      }
                      required
                    />
                    <Input
                      placeholder="Account Number"
                      value={newAccount.accountNumber}
                      onChange={(e) =>
                        setNewAccount({
                          ...newAccount,
                          accountNumber: e.target.value,
                        })
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Current Balance"
                      value={newAccount.balance}
                      onChange={(e) =>
                        setNewAccount({
                          ...newAccount,
                          balance: e.target.value,
                        })
                      }
                      required
                    />
                    <div className="flex gap-2">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Adding..." : "Add Bank Account"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowAccountForm(false)}
                        type="button"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="credit">
                  <form onSubmit={handleAddAccount} className="space-y-4">
                    <Input
                      placeholder="Card Name"
                      value={newAccount.name}
                      onChange={(e) =>
                        setNewAccount({ ...newAccount, name: e.target.value })
                      }
                      required
                    />
                    <Input
                      type="number"
                      placeholder="Current Balance"
                      value={newAccount.balance}
                      onChange={(e) =>
                        setNewAccount({
                          ...newAccount,
                          balance: e.target.value,
                        })
                      }
                      required
                    />
                    <Input
                      type="number"
                      placeholder="Credit Limit"
                      value={newAccount.creditLimit}
                      onChange={(e) =>
                        setNewAccount({
                          ...newAccount,
                          creditLimit: e.target.value,
                        })
                      }
                    />
                    <div className="flex gap-2">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Adding..." : "Add Credit Card"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowAccountForm(false)}
                        type="button"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Bank Balance
            </CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalBankBalance)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Credit Cards
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalCreditBalance)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Budget
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(budgets.reduce((sum, b) => sum + b.allocated, 0))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Spent
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(budgets.reduce((sum, b) => sum + b.spent, 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Budget Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {budgets.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-3">No budgets set up yet</p>
                <Button asChild size="sm">
                  <a href="/budgets">Set Up Budgets</a>
                </Button>
              </div>
            ) : (
              budgets.map((budget) => {
                const progress = (budget.spent / budget.allocated) * 100;

                return (
                  <div key={budget._id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{budget.category}</span>
                      <span>
                        ₹{budget.spent.toFixed(2)} / ₹{budget.allocated.toFixed(2)}
                      </span>
                    </div>
                    <Progress
                      value={progress}
                      className={`h-2 ${progress > 100 ? "bg-destructive" : ""}`}
                      indicatorClassName={
                        progress > 90 
                          ? "bg-red-500" 
                          : progress > 75 
                            ? "bg-yellow-500" 
                            : "bg-green-500"
                      }
                    />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {transactions.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-3">No transactions recorded yet</p>
                <Button asChild size="sm">
                  <a href="/transactions">Add Transactions</a>
                </Button>
              </div>
            ) : (
              recentTransactions.map((transaction) => {
                const isCredit = transaction.type === "credit";
                const amount = Math.abs(transaction.amount);
                
                return (
                  <div
                    key={transaction._id}
                    className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors"
                  >
                    <div className="space-y-1">
                      <h3 className="font-medium">{transaction.category}</h3>
                      <p className="text-sm text-muted-foreground">
                        {transaction.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${isCredit ? "text-green-600" : "text-red-600"}`}>
                        {isCredit ? "+" : "-"}₹{amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Account Balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="w-5 h-5" /> Bank Accounts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {accounts
              .filter((a) => a.type === "bank")
              .map((account) => (
                <div
                  key={account._id}
                  className="flex justify-between items-center p-2"
                >
                  <span>{account.name}</span>
                  <span>₹{account.balance.toFixed(2)}</span>
                </div>
              ))}
            {accounts.filter(a => a.type === "bank").length === 0 && (
              <p className="text-center text-muted-foreground py-2">No bank accounts added yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" /> Credit Cards
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {accounts
              .filter((a) => a.type === "credit-card")
              .map((account) => (
                <div
                  key={account._id}
                  className="flex justify-between items-center p-2"
                >
                  <span>{account.name}</span>
                  <span>₹{Math.abs(account.balance).toFixed(2)}</span>
                </div>
              ))}
            {accounts.filter(a => a.type === "credit-card").length === 0 && (
              <p className="text-center text-muted-foreground py-2">No credit cards added yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}