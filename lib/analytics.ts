import type { Transaction, Expense, ExpenseCategory, Enrollment, Course } from "./types";

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/**
 * Computes what a single enrollment owes for the current billing month vs
 * how much has actually been paid, based on recorded transactions.
 * - Private classes: due = hours attended so far this month × hourly rate.
 * - Group classes: due = the flat monthly fee (course default, or the
 *   enrollment's own override for cases like intensive break-time pricing).
 * `paid` only counts transactions tagged to this exact student+course within
 * the current calendar month, so it resets automatically each new month.
 */
export function getEnrollmentBalance(
  enrollment: Enrollment,
  course: Course,
  transactions: Transaction[],
  now: Date = new Date()
) {
  const due =
    course.type === "private"
      ? Math.round(enrollment.hoursUsed * (course.hourlyRate ?? 0))
      : Math.round(enrollment.monthlyFee ?? course.monthlyFee ?? 0);

  const paid = sum(
    transactions
      .filter(
        (t) =>
          t.studentId === enrollment.studentId &&
          t.courseId === enrollment.courseId &&
          isSameMonth(new Date(t.createdAt), now)
      )
      .map((t) => t.amount)
  );

  const balance = Math.max(0, due - paid);

  return { due, paid, balance, isPaid: balance <= 0 };
}

export function computeDashboardStats(transactions: Transaction[], expenses: Expense[]) {
  const now = new Date();

  const todayTx = transactions.filter((t) => isSameDay(new Date(t.createdAt), now));
  const monthTx = transactions.filter((t) => isSameMonth(new Date(t.createdAt), now));
  const monthEx = expenses.filter((e) => isSameMonth(new Date(e.createdAt), now));

  const todayTotal = sum(todayTx.map((t) => t.amount));
  const todayCash = sum(todayTx.filter((t) => t.method === "cash").map((t) => t.amount));
  const todayTransfer = sum(todayTx.filter((t) => t.method === "transfer").map((t) => t.amount));

  const monthCash = sum(monthTx.filter((t) => t.method === "cash").map((t) => t.amount));
  const monthTransfer = sum(monthTx.filter((t) => t.method === "transfer").map((t) => t.amount));
  const monthTotal = monthCash + monthTransfer;

  const monthExpenseTotal = sum(monthEx.map((e) => e.amount));
  const netProfit = monthTotal - monthExpenseTotal;

  // "Cash in drawer": cumulative cash collected minus cumulative cash paid out as expenses.
  const allCashIn = sum(transactions.filter((t) => t.method === "cash").map((t) => t.amount));
  const allCashOut = sum(expenses.filter((e) => e.method === "cash").map((e) => e.amount));
  const cashOnHand = allCashIn - allCashOut;

  const expenseByCategory = expenses.reduce<Record<ExpenseCategory, number>>(
    (acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + e.amount;
      return acc;
    },
    { payroll: 0, materials: 0, utilities: 0, marketing: 0, misc: 0 }
  );

  return {
    todayTotal,
    todayCash,
    todayTransfer,
    todayTx,
    monthCash,
    monthTransfer,
    monthTotal,
    monthExpenseTotal,
    netProfit,
    cashOnHand,
    expenseByCategory,
  };
}

function sum(nums: number[]) {
  return nums.reduce((a, b) => a + b, 0);
}
