export type Transaction = {
  id: string;
  amount: number;
  date: Date;
  description: string;
  category: string;
};

export const categories = [
  "Groceries",
  "Salary",
  "Coffee",
  "Dinner",
  "Transport",
  "Entertainment",
];

export const transactions: Transaction[] = [
  {
    id: "1",
    amount: -50.0,
    date: new Date("2024-07-01"),
    description: "Groceries",
    category: "Groceries",
  },
  {
    id: "2",
    amount: 2000.0,
    date: new Date("2024-07-01"),
    description: "Salary",
    category: "Salary",
  },
  {
    id: "3",
    amount: -25.0,
    date: new Date("2024-07-02"),
    description: "Coffee",
    category: "Coffee",
  },
  {
    id: "4",
    amount: -100.0,
    date: new Date("2024-07-03"),
    description: "Dinner",
    category: "Dinner",
  },
];