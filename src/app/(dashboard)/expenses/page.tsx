import { getExpenses, getMonthlyExpenseSummary } from "@/lib/queries/expense-queries";
import { ExpenseList } from "@/components/expenses/expense-list";
import { serialize } from "@/lib/utils";
import type { SerializedExpense } from "@/components/expenses/expense-list";

export default async function ExpensesPage() {
  const [expenses, monthlySummary] = await Promise.all([
    getExpenses(),
    getMonthlyExpenseSummary(),
  ]);

  return (
    <ExpenseList
      expenses={serialize(expenses) as unknown as SerializedExpense[]}
      monthlySummary={monthlySummary}
    />
  );
}
