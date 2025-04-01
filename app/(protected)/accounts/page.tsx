"use client";

import { useState, useEffect } from "react";
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
import { Banknote, CreditCard, Trash2, Edit, AlertCircle } from "lucide-react";
import { useFinanceStore } from "@/lib/store";
import EmptyState from "@/components/EmptyState";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCurrency } from "@/lib/utils";

export default function AccountsPage() {
  const [newAccount, setNewAccount] = useState({
    name: "",
    type: "bank",
    balance: "",
    accountNumber: "",
    creditLimit: "",
  });

  const { accounts, addAccount, deleteAccount, initialize, isLoading, error } = useFinanceStore();
  
  // Initialize store if needed
  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAccount({
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
  };

  const handleDelete = (accountId: string) => {
    if (confirm("Are you sure you want to delete this account? This action cannot be undone.")) {
      deleteAccount(accountId);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Your Accounts</h1>

      {error && (
        <Alert variant="destructive" className="mb-4 md:mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Add Account Form */}
        <Card>
          <CardHeader className="pb-2 md:pb-4">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Banknote className="w-4 h-4 md:w-5 md:h-5" /> Add Financial Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
              <Input
                placeholder="Account Name"
                value={newAccount.name}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, name: e.target.value })
                }
                required
              />

              <Select
                value={newAccount.type}
                onValueChange={(value) =>
                  setNewAccount({ ...newAccount, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Account Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Bank Account</SelectItem>
                  <SelectItem value="credit-card">Credit Card</SelectItem>
                </SelectContent>
              </Select>

              {newAccount.type === "credit-card" && (
                <Input
                  placeholder="Credit Limit"
                  type="number"
                  value={newAccount.creditLimit}
                  onChange={(e) =>
                    setNewAccount({
                      ...newAccount,
                      creditLimit: e.target.value,
                    })
                  }
                />
              )}

              <Input
                placeholder="Current Balance"
                type="number"
                value={newAccount.balance}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, balance: e.target.value })
                }
                required
              />

              <Input
                placeholder="Account Number (Optional)"
                value={newAccount.accountNumber}
                onChange={(e) =>
                  setNewAccount({
                    ...newAccount,
                    accountNumber: e.target.value,
                  })
                }
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Account"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Accounts List */}
        <div className="space-y-4">
          {accounts.length === 0 ? (
            <EmptyState
              title="No Accounts Yet"
              description="Add your first bank account or credit card to start tracking your finances."
              icon={<CreditCard className="h-8 w-8 text-primary" />}
              actionLabel="Add Your First Account"
              actionLink="#"
            />
          ) : (
            <>
              <h2 className="text-xl font-semibold">Your Accounts</h2>
              
              {/* Bank Accounts */}
              {accounts.filter(account => account.type === "bank").length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Bank Accounts</h3>
                  {accounts
                    .filter(account => account.type === "bank")
                    .map((account) => (
                      <Card key={account._id} className="mb-3">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{account.name}</h3>
                            {account.accountNumber && (
                              <p className="text-sm text-muted-foreground">
                                •••• {account.accountNumber.slice(-4)}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <p className="font-medium">{formatCurrency(account.balance)}</p>
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-9 w-9 p-0" 
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-9 w-9 p-0" 
                                title="Delete"
                                onClick={() => handleDelete(account._id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
              
              {/* Credit Cards */}
              {accounts.filter(account => account.type === "credit-card").length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Credit Cards</h3>
                  {accounts
                    .filter(account => account.type === "credit-card")
                    .map((account) => (
                      <Card key={account._id} className="mb-3">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{account.name}</h3>
                            {account.creditLimit && (
                              <p className="text-sm text-muted-foreground">
                                Limit: {formatCurrency(account.creditLimit)}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <p className="font-medium">{formatCurrency(Math.abs(account.balance))}</p>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" title="Edit">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                title="Delete"
                                onClick={() => handleDelete(account._id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}