"use client";

import {
  Banknote,
  CreditCard,
  Clock,
  TrendingUp,
  Plus,
  IndianRupee,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFinanceStore } from "@/lib/store";
import { Navbar } from "@/components/navbar";
import { useState } from "react";

export default function Home() {
  const { transactions, budgets, accounts, addAccount } = useFinanceStore();
  const [newAccount, setNewAccount] = useState({
    name: "",
    type: "bank",
    balance: "",
    accountNumber: "",
    creditLimit: "",
  });
  const [showAccountForm, setShowAccountForm] = useState(false);

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    addAccount({
      ...newAccount,
      balance: parseFloat(newAccount.balance),
      creditLimit: newAccount.creditLimit
        ? parseFloat(newAccount.creditLimit)
        : undefined,
      accountNumber: newAccount.accountNumber || undefined,
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

  // Format currency with Indian numbering system
  const formatINR = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace("₹", "₹ ");
  };

  // Calculate totals
  const totalBankBalance = accounts
    .filter((a) => a.type === "bank")
    .reduce((sum, acc) => sum + acc.balance, 0);

  const totalCreditBalance = accounts
    .filter((a) => a.type === "credit-card")
    .reduce((sum, acc) => sum + acc.balance, 0);

  const recentTransactions = transactions.slice(-5).reverse();

  return (
    <div className="min-h-screen">
      {/* <Navbar /> */}

      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Financial Overview</h1>

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
                        <Button type="submit">Add Bank Account</Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowAccountForm(false)}
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
                        <Button type="submit">Add Credit Card</Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowAccountForm(false)}
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
                {formatINR(totalBankBalance)}
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
                {formatINR(totalCreditBalance)}
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
                {formatINR(budgets.reduce((sum, b) => sum + b.allocated, 0))}
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
                {formatINR(transactions.reduce((sum, t) => sum + t.amount, 0))}
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
              {budgets.map((budget) => {
                const spent = transactions
                  .filter((t) => t.category === budget.category)
                  .reduce((sum, t) => sum + t.amount, 0);

                const progress = (spent / budget.allocated) * 100;

                return (
                  <div key={budget.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{budget.category}</span>
                      <span>
                        ₹{spent.toFixed(2)} / ${budget.allocated.toFixed(2)}
                      </span>
                    </div>
                    <Progress
                      value={progress}
                      className={`h-2 ${
                        progress > 100 ? "bg-destructive" : ""
                      }`}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors"
                >
                  <div className="space-y-1">
                    <h3 className="font-medium">{transaction.category}</h3>
                    <p className="text-sm text-muted-foreground">
                      {transaction.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      -₹{transaction.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
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
                    key={account.id}
                    className="flex justify-between items-center p-2"
                  >
                    <span>{account.name}</span>
                    <span>₹{account.balance.toFixed(2)}</span>
                  </div>
                ))}
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
                    key={account.id}
                    className="flex justify-between items-center p-2"
                  >
                    <span>{account.name}</span>
                    <span>₹{account.balance.toFixed(2)}</span>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
