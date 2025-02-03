"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useFinanceStore } from "@/lib/store";
import { IndianRupee } from "lucide-react";

export default function BudgetPage() {
  const { budgets, categories, addBudget, addCategory } = useFinanceStore();
  const [newCategory, setNewCategory] = useState("");
  const [newBudget, setNewBudget] = useState({
    category: "",
    allocated: "",
    period: new Date().toISOString().slice(0, 7),
  });

  const handleAddCategory = () => {
    if (newCategory) {
      addCategory(newCategory);
      setNewCategory("");
    }
  };

  const handleAddBudget = (e: React.FormEvent) => {
    e.preventDefault();
    addBudget({
      category: newBudget.category,
      allocated: parseFloat(newBudget.allocated),
      period: newBudget.period,
    });
    setNewBudget({ category: "", allocated: "", period: "" });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Management */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Budget</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <select
                value={newBudget.category}
                onChange={(e) =>
                  setNewBudget({ ...newBudget, category: e.target.value })
                }
                className="w-full p-2 border rounded"
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <Input
                type="number"
                placeholder="Allocated Amount"
                value={newBudget.allocated}
                onChange={(e) =>
                  setNewBudget({ ...newBudget, allocated: e.target.value })
                }
              />

              <Input
                type="month"
                value={newBudget.period}
                onChange={(e) =>
                  setNewBudget({ ...newBudget, period: e.target.value })
                }
              />

              <Button onClick={handleAddBudget}>Add Budget</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add New Category</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Input
                placeholder="New Category Name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <Button onClick={handleAddCategory}>Add</Button>
            </CardContent>
          </Card>
        </div>

        {/* Budget Progress */}
        <div className="space-y-4">
          {budgets.map((budget) => (
            <Card key={budget.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between">
                  <h3 className="font-medium">{budget.category}</h3>
                  <div className="flex ">
                    <div className="flex flex-row items-center mr-0.5">
                      <IndianRupee className="h-5 w-5" />
                      {budget.spent.toFixed(2)}{" "}
                    </div>{" "}
                    /{" "}
                    <div className="ml-0.5 flex flex-row items-center">
                      <IndianRupee className="h-5 w-5" />
                      {budget.allocated.toFixed(2)}
                    </div>
                  </div>
                </div>
                <Progress
                  value={(budget.spent / budget.allocated) * 100}
                  className="h-2"
                />
                <div className="text-sm text-muted-foreground">
                  {new Date(budget.period).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
