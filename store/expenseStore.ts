// store/expenseStore.ts
import { create } from "zustand";
import { IDailyExpense } from "@/lib/models/DailyExpense";

interface ExpenseStore {
  expenses: IDailyExpense[];
  totalExpenses: number;
  setExpenses: (expenses: IDailyExpense[]) => void;
  addExpense: (expense: IDailyExpense) => void;
  updateExpense: (id: string, expense: IDailyExpense) => void;
  deleteExpense: (id: string) => void;
  setTotalExpenses: (total: number) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useExpenseStore = create<ExpenseStore>((set) => ({
  expenses: [],
  totalExpenses: 0,
  loading: false,
  error: null,

  setExpenses: (expenses) => set({ expenses }),

  addExpense: (expense) =>
    set((state) => ({
      expenses: [expense, ...state.expenses],
      totalExpenses: state.totalExpenses + expense.amount,
    })),

  updateExpense: (id, expense) =>
    set((state) => {
      const oldExpense = state.expenses.find((e) => e._id?.toString() === id);
      const expenseDifference = oldExpense
        ? expense.amount - oldExpense.amount
        : expense.amount;

      return {
        expenses: state.expenses.map((e) =>
          e._id?.toString() === id ? expense : e
        ),
        totalExpenses: state.totalExpenses + expenseDifference,
      };
    }),

  deleteExpense: (id) =>
    set((state) => {
      const expenseToDelete = state.expenses.find(
        (e) => e._id?.toString() === id
      );
      return {
        expenses: state.expenses.filter((e) => e._id?.toString() !== id),
        totalExpenses: expenseToDelete
          ? state.totalExpenses - expenseToDelete.amount
          : state.totalExpenses,
      };
    }),

  setTotalExpenses: (totalExpenses) => set({ totalExpenses }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
