import { Progress } from "@/components/ui/progress";

function BudgetProgress({ category, spent, budget }) {
  const percentage = (spent / budget) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span>{category}</span>
        <span>
          ${spent} / ${budget}
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
}
