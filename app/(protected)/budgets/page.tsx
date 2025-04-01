"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/Progress";
import { 
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useFinanceStore } from "@/lib/store";
import { IndianRupee, Plus, AlertCircle, Wallet, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import EmptyState from "@/components/EmptyState";
import { getCurrentMonthYear, formatDate } from "@/lib/utils";

export default function BudgetPage() {
  const { budgets, categories, addBudget, addCategory, deleteBudget, initialize, isLoading, error } = useFinanceStore();
  const [newCategory, setNewCategory] = useState("");
  const [newBudget, setNewBudget] = useState({
    category: "",
    allocated: "",
    period: getCurrentMonthYear(),
  });
  const [showAddCategory, setShowAddCategory] = useState(false);

  // Initialize store if needed
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

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await addBudget({
      category: newBudget.category,
      allocated: parseFloat(newBudget.allocated),
      period: newBudget.period,
    });
    
    setNewBudget({ 
      category: "", 
      allocated: "", 
      period: getCurrentMonthYear() 
    });
  };

  const handleDeleteBudget = (budgetId: string) => {
    if (confirm("Are you sure you want to delete this budget?")) {
      deleteBudget(budgetId);
    }
  };

  if (isLoading && categories.length === 0 && budgets.length === 0) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Budget Management</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Management */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Budget</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {categories.length === 0 ? (
                <div className="text-center p-4 bg-muted rounded-md">
                  <p className="mb-2">You need to create categories first</p>
                  <Button onClick={() => setShowAddCategory(true)}>
                    Add Your First Category
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleAddBudget} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <div className="flex gap-2">
                      <Select
                        value={newBudget.category}
                        onValueChange={(value) =>
                          setNewBudget({ ...newBudget, category: value })
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
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowAddCategory(true)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Allocated Amount</label>
                    <Input
                      type="number"
                      placeholder="Allocated Amount"
                      value={newBudget.allocated}
                      onChange={(e) =>
                        setNewBudget({ ...newBudget, allocated: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Period</label>
                    <Input
                      type="month"
                      value={newBudget.period}
                      onChange={(e) =>
                        setNewBudget({ ...newBudget, period: e.target.value })
                      }
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Adding..." : "Add Budget"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {showAddCategory && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="New Category Name"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button onClick={handleAddCategory} disabled={isLoading} className="flex-1">
                    {isLoading ? "Adding..." : "Add Category"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAddCategory(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!showAddCategory && categories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Your Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <div 
                      key={category} 
                      className="bg-muted px-3 py-1 rounded-full text-sm"
                    >
                      {category}
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="rounded-full px-3"
                    onClick={() => setShowAddCategory(true)}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Budget Progress */}
        <div className="space-y-4">
          {budgets.length === 0 ? (
            <EmptyState
              title="No Budgets Yet"
              description="Create your first budget to start tracking your spending."
              icon={<Wallet className="h-8 w-8 text-primary" />}
              actionLabel="Create Budget"
              actionLink="#"
            />
          ) : (
            <>
              <h2 className="text-xl font-semibold">Your Budgets</h2>
              {budgets.map((budget) => (
                <Card key={budget._id}>
                  <CardContent className="p-3 md:p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{budget.category}</h3>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-9 w-9 p-0"
                          onClick={() => handleDeleteBudget(budget._id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                        <div className="flex">
                          <div className="flex flex-row items-center mr-0.5">
                            <IndianRupee className="h-3 w-3 md:h-4 md:w-4" />
                            {budget.spent.toFixed(2)}{" "}
                          </div>{" "}
                          /{" "}
                          <div className="ml-0.5 flex flex-row items-center">
                            <IndianRupee className="h-3 w-3 md:h-4 md:w-4" />
                            {budget.allocated.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Progress
                      value={(budget.spent / budget.allocated) * 100}
                      className="h-3"
                      indicatorClassName={
                        (budget.spent / budget.allocated) * 100 > 90 
                          ? "bg-red-500" 
                          : (budget.spent / budget.allocated) * 100 > 75 
                            ? "bg-yellow-500" 
                            : "bg-green-500"
                      }
                    />
                    
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{((budget.spent / budget.allocated) * 100).toFixed(0)}% used</span>
                      <span>{formatDate(budget.period, "monthYear")}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}