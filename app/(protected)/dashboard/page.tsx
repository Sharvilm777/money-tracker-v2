"use client";

import { useState, useEffect } from "react";
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Area,
  Scatter,
  ScatterChart,
  ZAxis,
  RadialBarChart,
  RadialBar,
  Treemap,
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
  AreaChart,
  Layers,
  Activity,
  Calendar,
  TrendingUp,
  Sparkles,
  Store,
  PlusCircle,
  MinusCircle,
  DollarSign,
} from "lucide-react";
import { Progress } from "@/components/Progress";
import { Skeleton } from "@/components/skeleton";

import { useFinanceStore } from "@/lib/store";
import api from "@/lib/api";
import { DashboardData } from "@/lib/types";

const COLORS = [
  "#6366f1",
  "#14b8a6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#10b981",
  "#ec4899",
  "#84cc16",
  "#06b6d4",
  "#f97316",
];

export default function DashboardPage() {
  const [timePeriod, setTimePeriod] = useState("current-month");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data from API
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const data = await api.dashboard.getData(timePeriod);
        setDashboardData(data);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [timePeriod]);

  // Handle loading state
  if (loading && !dashboardData) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <PieIcon className="w-8 h-8" /> Financial Dashboard
          </h1>
          <Skeleton className="w-[180px] h-10" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className={i > 2 ? "lg:col-span-1" : ""}>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="h-[400px]">
                <Skeleton className="h-full w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
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
              <SelectItem value="all-time">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Card className="p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-500 mb-2">
              Error Loading Dashboard
            </h2>
            <p className="text-slate-600">{error}</p>
            <button
              onClick={() => setTimePeriod(timePeriod)}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        </Card>
      </div>
    );
  }

  // If we have data, render the dashboard
  if (!dashboardData) return null;

  const {
    summary,
    spendingByCategory,
    budgetVsActual,
    monthlySpendingTrend,
    incomeVsExpenses,
    accounts,
    topMerchants,
    transactionsByDayOfWeek,
    transactionCountByCategory,
    creditCardUtilization,
    cashFlowAnalysis,
  } = dashboardData;

  // Calculate savings rate
  const savingsRate =
    summary.totalIncome > 0
      ? (summary.totalSavings / summary.totalIncome) * 100
      : 0;

  // Process cash flow data for the chart
  const cashFlowData = cashFlowAnalysis.map((item) => ({
    month: new Date(item.month + "-01").toLocaleString("default", {
      month: "short",
      year: "2-digit",
    }),
    inflow: item.inflow,
    outflow: item.outflow,
    netFlow: item.netFlow,
  }));

  // Process income vs expenses data
  const incomeExpensesData: any[] = [];
  const months = new Set<string>();
  
  incomeVsExpenses.forEach((item) => {
    months.add(item.month);
  });

  // Sort months chronologically
  const sortedMonths = Array.from(months).sort();
  
  sortedMonths.forEach(month => {
    const income = incomeVsExpenses.find(item => 
      item.month === month && item.type === 'credit'
    )?.amount || 0;
    
    const expense = incomeVsExpenses.find(item => 
      item.month === month && item.type === 'debit'
    )?.amount || 0;
    
    incomeExpensesData.push({
      month: new Date(month + '-01').toLocaleString('default', { month: 'short', year: '2-digit' }),
      income,
      expense
    });
  });

  return (
        <div className="container mx-auto px-4 py-4 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-8 gap-3 md:gap-0">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <PieIcon className="w-6 h-6 md:w-8 md:h-8" /> Financial Dashboard
            </h1>
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Select Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current-month">Current Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="all-time">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <PlusCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{summary.totalIncome.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <MinusCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{summary.totalExpenses.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings</CardTitle>
            <Wallet className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{summary.totalSavings.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {savingsRate.toFixed(1)}% of income
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{summary.netWorth.total.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 1. Spending by Category - Pie Chart */}
         {/* 1. Spending by Category - Pie Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <PieIcon className="w-4 h-4 md:w-5 md:h-5" /> Spending by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={spendingByCategory}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label={({ category, percent }) =>
                    `${category}: ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {spendingByCategory.map((_: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, "Amount"]}
                />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 2. Budget vs Actual - Horizontal Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarIcon className="w-5 h-5" /> Budget vs Actual
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={budgetVsActual}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  type="category"
                  dataKey="category"
                  width={80}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, ""]}
                />
                <Legend />
                <Bar dataKey="allocated" fill="#8884d8" name="Budget" />
                <Bar dataKey="spent" fill="#82ca9d" name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 3. Monthly Spending Trend - Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineIcon className="w-5 h-5" /> Monthly Spending Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlySpendingTrend.map((item) => ({
                  month: new Date(item.month + "-01").toLocaleString("default", {
                    month: "short",
                    year: "2-digit",
                  }),
                  amount: item.amount,
                }))}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, "Amount"]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                  name="Spending"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 4. Income vs Expenses - Composed Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" /> Income vs Expenses
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={incomeExpensesData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, ""]}
                />
                <Legend />
                <Bar dataKey="income" fill="#4ade80" name="Income" />
                <Bar dataKey="expense" fill="#f87171" name="Expenses" />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#4ade80"
                  dot={false}
                  activeDot={false}
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="#f87171"
                  dot={false}
                  activeDot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 5. Cash Flow Analysis - Area Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AreaChart className="w-5 h-5" /> Cash Flow Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={cashFlowData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, ""]}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="inflow"
                  fill="#bfdbfe"
                  stroke="#3b82f6"
                  name="Inflow"
                />
                <Area
                  type="monotone"
                  dataKey="outflow"
                  fill="#fecaca"
                  stroke="#ef4444"
                  name="Outflow"
                />
                <Line
                  type="monotone"
                  dataKey="netFlow"
                  stroke="#10b981"
                  name="Net Flow"
                  strokeWidth={2}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 6. Top Merchants - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5" /> Top Merchants
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topMerchants.slice(0, 7)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  type="category"
                  dataKey="merchant"
                  width={100}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, "Amount"]}
                />
                <Bar dataKey="amount" fill="#8884d8">
                  {topMerchants.slice(0, 7).map((_: any, index: number) => (
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

        {/* 7. Transactions by Day of Week - Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" /> Spending by Day of Week
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                outerRadius={90}
                data={transactionsByDayOfWeek}
              >
                <PolarGrid />
                <PolarAngleAxis dataKey="day" />
                <PolarRadiusAxis />
                <Radar
                  name="Amount"
                  dataKey="amount"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
                <Tooltip
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, "Amount"]}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 8. Transaction Count by Category - Treemap */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5" /> Transaction Count by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={transactionCountByCategory}
                dataKey="count"
                nameKey="category"
                fill="#8884d8"
                content={<CustomizedContent colors={COLORS} />}
              >
                <Tooltip 
                  formatter={(value: number) => [`${value} transactions`, ""]}
                />
              </Treemap>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 9. Credit Card Utilization - Radial Bar Chart */}
        <div className="border rounded-lg">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2 font-semibold">
              <CreditCard className="w-5 h-5" /> Credit Card Utilization
            </div>
          </div>
          <div className="p-4 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius={20}
                outerRadius={120}
                barSize={15}
                data={creditCardUtilization.map((item, index) => ({
                  ...item,
                  fill: COLORS[index % COLORS.length],
                }))}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar
                  background
                  dataKey="utilization"
                  label={{ position: 'insideStart', fill: '#fff', fontSize: 12 }}
                  name="Utilization %"
                />
                <Legend
                  iconSize={10}
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  wrapperStyle={{
                    fontSize: '12px',
                    paddingLeft: '10px'
                  }}
                  formatter={(value) => {
                    const card = creditCardUtilization.find((c) => c.name === value);
                    return [`${value} (${card?.utilization.toFixed(1)}%)`, null];
                  }}
                />
                <Tooltip
                  formatter={(value) => [`${value.toFixed(1)}%`, "Utilization"]}
                  labelFormatter={(name) => {
                    const card = creditCardUtilization.find((c) => c.name === name);
                    return `₹${card?.balance.toLocaleString()} of ₹${card?.limit.toLocaleString()}`;
                  }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 10. Budget Progress - Custom Visualization with Progress Bars */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" /> Budget Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] overflow-auto">
            <div className="space-y-6">
              {budgetVsActual.map((budget, index) => {
                const percentUsed = (budget.spent / budget.allocated) * 100;
                const color = percentUsed > 90 
                  ? "bg-red-500" 
                  : percentUsed > 75 
                    ? "bg-yellow-500" 
                    : "bg-green-500";
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-sm">{budget.category}</span>
                      <span className="text-sm text-muted-foreground">
                        ₹{budget.spent.toLocaleString()} of ₹{budget.allocated.toLocaleString()}
                      </span>
                    </div>
                    <Progress 
                      value={percentUsed > 100 ? 100 : percentUsed} 
                      className={percentUsed > 100 ? "bg-red-200" : "bg-slate-200"}
                      indicatorClassName={color}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{percentUsed.toFixed(1)}% used</span>
                      <span>₹{budget.remaining.toLocaleString()} remaining</span>
                    </div>
                  </div>
                );
              })}
            </div>
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
            {accounts
              .filter((account) => account.type === "bank")
              .map((account) => (
                <div
                  key={account._id}
                  className="flex justify-between items-center p-2 hover:bg-muted rounded"
                >
                  <span>{account.name}</span>
                  <span>₹{account.balance.toLocaleString()}</span>
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
            {accounts
              .filter((account) => account.type === "credit-card")
              .map((card) => (
                <div
                  key={card._id}
                  className="flex justify-between items-center p-2 hover:bg-muted rounded"
                >
                  <span>{card.name}</span>
                  <span>₹{Math.abs(card.balance).toLocaleString()}</span>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Custom content component for the Treemap
function CustomizedContent(props: any) {
  const { root, depth, x, y, width, height, index, colors, name, value } = props;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: depth < 2 ? colors[index % colors.length] : '#ffffff00',
          stroke: '#fff',
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10),
        }}
      />
      {depth === 1 && (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - 7}
            textAnchor="middle"
            fill="#fff"
            fontSize={14}
            fontWeight="bold"
          >
            {name}
          </text>
          <text
            x={x + width / 2}
            y={y + height / 2 + 7}
            textAnchor="middle"
            fill="#fff"
            fontSize={12}
          >
            {value}
          </text>
        </>
      )}
    </g>
  );
}