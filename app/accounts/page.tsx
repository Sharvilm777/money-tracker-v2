"use client";
// @ts-nocheck
import { useState } from "react";
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
import { Banknote, CreditCard } from "lucide-react";
import { useFinanceStore } from "@/lib/store";

export default function AccountsPage() {
  const [newAccount, setNewAccount] = useState({
    name: "",
    type: "bank",
    balance: "",
    number: "",
    creditLimit: "",
  });

  const { accounts, addAccount } = useFinanceStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAccount({
      ...newAccount as any,
      balance: parseFloat(newAccount.balance),
      creditLimit: newAccount.creditLimit
        ? parseFloat(newAccount.creditLimit)
        : undefined,

      number: newAccount.number || undefined,
    });
    setNewAccount({
      name: "",
      type: "bank",
      balance: "",
      number: "",
      creditLimit: "",
    });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Account Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="w-5 h-5" /> Add Financial Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <Button type="submit" className="w-full">
                Add Account
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Accounts List */}
        <div className="space-y-4">
          {accounts.map((account) => (
            <Card key={account.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{account.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {account.type === "bank" ? "Bank Account" : "Credit Card"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${account.balance.toFixed(2)}</p>
                  {account.type === "credit-card" && account.creditLimit && (
                    <p className="text-sm text-muted-foreground">
                      Limit: ${account.creditLimit.toFixed(2)}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
