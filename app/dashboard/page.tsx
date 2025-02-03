"use client";

import { useState } from "react";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import {
    Banknote,
    CreditCard,
    Wallet,
    PieChart as PieIcon,
    BarChart as BarIcon,
    LineChart as LineIcon,
} from "lucide-react";
import { useFinanceStore } from "@/lib/store";

const COLORS = [
    "#6366f1",
    "#14b8a6",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#10b981",
];

export default function DashboardPage() {
    const { transactions, budgets, accounts } = useFinanceStore();
    const [timePeriod, setTimePeriod] = useState("current-month");

    // Data calculations
    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
    const creditCards = accounts.filter((a) => a.type === "credit-card");
    const bankAccounts = accounts.filter((a) => a.type === "bank");

    // Spending by category
    const categorySpending = transactions.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
    }, {} as Record<string, number>);

    // Spending over time
    const monthlySpending = transactions.reduce((acc, t) => {
        const month = new Date(t.date).toLocaleString("default", {
            month: "short",
        });
        acc[month] = (acc[month] || 0) + t.amount;
        return acc;
    }, {} as Record<string, number>);

    // Budget progress data
    const budgetData = budgets.map((budget) => ({
        name: budget.category,
        allocated: budget.allocated,
        spent: categorySpending[budget.category] || 0,
    }));

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <PieIcon className="w-8 h-8" /> Financial Dashboard
                </h1>
                <Select value={timePeriod} onValueChange={setTimePeriod}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Period" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="current-month">Current Month</SelectItem>
                        <SelectItem value="last-month">Last Month</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹ {totalSpent.toFixed(2)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Bank Balances</CardTitle>
                        <Banknote className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ₹ {bankAccounts.reduce((sum, a) => sum + a.balance, 0).toFixed(2)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Credit Card Debt
                        </CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ₹ {creditCards.reduce((sum, a) => sum + a.balance, 0).toFixed(2)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Spending by Category */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarIcon className="w-5 h-5" /> Spending by Category
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={Object.entries(categorySpending).map(([name, value]) => ({
                                    name,
                                    value,
                                }))}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#6366f1">
                                    {Object.keys(categorySpending).map((_, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Budget Progress */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieIcon className="w-5 h-5" /> Budget Allocation
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={budgetData}
                                    dataKey="allocated"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8"
                                    label
                                >
                                    {budgetData.map((_, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Spending Trend */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <LineIcon className="w-5 h-5" /> Spending Trend
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={Object.entries(monthlySpending).map(([name, value]) => ({
                                    name,
                                    value,
                                }))}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#6366f1"
                                    strokeWidth={2}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Accounts Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Banknote className="w-5 h-5" /> Bank Accounts
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {bankAccounts.map((account) => (
                            <div
                                key={account.id}
                                className="flex justify-between items-center p-2 hover:bg-muted rounded"
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
                    <CardContent className="space-y-2">
                        {creditCards.map((card) => (
                            <div
                                key={card.id}
                                className="flex justify-between items-center p-2 hover:bg-muted rounded"
                            >
                                <span>{card.name}</span>
                                <span>₹{card.balance.toFixed(2)}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
