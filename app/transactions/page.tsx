"use client";
import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  IndianRupee,
  Filter,
  CreditCard,
  Banknote,
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
import { useFinanceStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function TransactionsPage() {
  const { accounts, categories, transactions, addTransaction } =
    useFinanceStore();
  const [filters, setFilters] = useState({
    type: "",
    category: "",
    source: "",
    minAmount: "",
    maxAmount: "",
    creditCardCycle: "",
  });

  const [newTransaction, setNewTransaction] = useState({
    amount: "",
    type: "debit",
    category: "",
    subCategory: "",
    description: "",
    date: new Date().toISOString(),
    sourceAccount: "",
  });

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace("₹", "₹ ");
  };

  const getBillingCycle = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + (date.getDate() > 15 ? 1 : 0);
    const year = date.getFullYear() + (month > 11 ? 1 : 0);
    return `${new Date(year, month % 12).toLocaleString("default", {
      month: "short",
    })} ${year}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(newTransaction.amount);
    const isCredit = newTransaction.type === "credit";

    addTransaction({
      ...newTransaction as any,
      amount: isCredit ? amount : -amount,
      date: new Date(newTransaction.date).toISOString(),
      billingCycle: getBillingCycle(newTransaction.date),
    });

    setNewTransaction({
      amount: "",
      type: "debit",
      category: "",
      subCategory: "",
      description: "",
      date: new Date().toISOString(),
      sourceAccount: "",
    });
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    const sourceAccount = accounts.find(
      (a) => a.id === transaction.sourceAccount
    );

    return (
      (!filters.type ||
        transaction.amount
          .toString()
          .startsWith(filters.type === "credit" ? "" : "-")) &&
      (!filters.category || transaction.category === filters.category) &&
      (!filters.source || transaction.sourceAccount === filters.source) &&
      (!filters.minAmount ||
        Math.abs(transaction.amount) >= parseFloat(filters.minAmount)) &&
      (!filters.maxAmount ||
        Math.abs(transaction.amount) <= parseFloat(filters.maxAmount)) &&
      (!filters.creditCardCycle ||
        (sourceAccount?.type === "credit-card" &&
          getBillingCycle(transaction.date) === filters.creditCardCycle))
    );
  });

  const creditCardCycles = Array.from(
    new Set(
      transactions
        .filter(
          (t) =>
            accounts.find((a) => a.id === t.sourceAccount)?.type ===
            "credit-card"
        )
        .map((t) => getBillingCycle(t.date))
    )
  ).sort();
  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>New Transaction</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                    <SelectItem value="debit">Debit</SelectItem>
                    <SelectItem value="credit">Credit</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="number"
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

                <Input
                  placeholder="Sub Category"
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
                    <SelectValue placeholder="Select Source" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} (
                        {account.type === "bank" ? "Bank" : "Credit Card"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button type="submit" className="w-full">
                  Add Transaction
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Transactions List */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" /> Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="credit">Credits</SelectItem>
                  <SelectItem value="debit">Debits</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.creditCardCycle}
                onValueChange={(value) =>
                  setFilters({ ...filters, creditCardCycle: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Credit Card Cycle" />
                </SelectTrigger>
                <SelectContent>
                  {creditCardCycles.map((cycle) => (
                    <SelectItem key={cycle} value={cycle}>
                      {cycle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Other filters */}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4">
              {filteredTransactions.map((transaction) => {
                const isCredit = transaction.type === "credit" ? true : false;
                const sourceAccount = accounts.find(
                  (a) => a.id === transaction.sourceAccount
                );
                const amount = Math.abs(transaction.amount);

                return (
                  <div
                    key={transaction.id}
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
                                ? `Billing: ${getBillingCycle(
                                  transaction.date
                                )}`
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
                        {formatINR(amount)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
