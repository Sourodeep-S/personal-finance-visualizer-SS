export type Budget = {
  category: string;
  amount: number;
};

export const budgets: Budget[] = [
  {
    category: "Groceries",
    amount: 200,
  },
  {
    category: "Coffee",
    amount: 50,
  },
  {
    category: "Dinner",
    amount: 150,
  },
  {
    category: "Transport",
    amount: 100,
  },
  {
    category: "Entertainment",
    amount: 100,
  },
];