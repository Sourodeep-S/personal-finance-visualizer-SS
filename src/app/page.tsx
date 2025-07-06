"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";


import { useState, useEffect } from "react";
import { generateColor } from "@/lib/colors";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
// import { Progress } from "@/components/ui/progress";
import {
  transactions as initialTransactions,
  Transaction,
  categories as initialCategories,
} from "@/lib/data";
import { budgets as initialBudgets, Budget } from "@/lib/budget";
import { AddTransactionForm } from "@/components/add-transaction-form";
import { EditTransactionForm } from "@/components/edit-transaction-form";
import { SetBudgetForm } from "@/components/set-budget-form";
import { AddCategoryForm } from "@/components/add-category-form";
import { AlertTriangle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";


export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState<string | null>(null);
  const [openSetBudget, setOpenSetBudget] = useState(false);
  const [openAddCategory, setOpenAddCategory] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedTransactions = localStorage.getItem("transactions");
    if (storedTransactions) {
      setTransactions(
        JSON.parse(storedTransactions, (key, value) => {
          if (key === "date") return new Date(value);
          return value;
        })
      );
    } else {
      setTransactions(initialTransactions);
    }

    const storedBudgets = localStorage.getItem("budgets");
    if (storedBudgets) {
      setBudgets(JSON.parse(storedBudgets));
    } else {
      setBudgets(initialBudgets);
    }

    const storedCategories = localStorage.getItem("categories");
    if (storedCategories) {
      setCategories(JSON.parse(storedCategories));
    } else {
      setCategories(initialCategories);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("transactions", JSON.stringify(transactions));
    }
  }, [transactions, isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("budgets", JSON.stringify(budgets));
    }
  }, [budgets, isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("categories", JSON.stringify(categories));
    }
  }, [categories, isClient]);

  const totalIncome = transactions
    .filter((t) => t.amount > 0)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const handleAddTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransactions = [
      ...transactions,
      { ...transaction, id: crypto.randomUUID() },
    ];
    setTransactions(newTransactions);
    setOpenAdd(false);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    const newTransactions = transactions.map((t) =>
      t.id === transaction.id ? transaction : t
    );
    setTransactions(newTransactions);
    setOpenEdit(null);
  };

  const handleDeleteTransaction = (id: string) => {
    const newTransactions = transactions.filter((t) => t.id !== id);
    setTransactions(newTransactions);
  };

  const handleSetBudget = (category: string, amount: number) => {
    const existing = budgets.find((b) => b.category === category);
    if (existing) {
      const newBudgets = budgets.map((b) =>
        b.category === category ? { ...b, amount } : b
      );
      setBudgets(newBudgets);
    } else {
      const newBudgets = [...budgets, { category, amount }];
      setBudgets(newBudgets);
    }
  };

  const handleAddCategory = (name: string) => {
    const newCategories = [...categories, name];
    setCategories(newCategories);
    setOpenAddCategory(false);
  };

  const monthlyExpenses =
    isClient && transactions.length > 0
      ? Object.values(
        transactions
          .filter((t) => t.amount < 0)
          .reduce((acc, t) => {
            const month = t.date.toLocaleString("default", {
              month: "long",
            });
            if (!acc[month]) {
              acc[month] = { month };
            }
            if (!acc[month][t.category]) {
              acc[month][t.category] = 0;
            }
            acc[month][t.category] += Math.abs(t.amount);
            return acc;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          }, {} as { [key: string]: { month: string;[key: string]: any } })
      )
      : [];

  const categoryExpenses =
    isClient && transactions.length > 0
      ? transactions
        .filter((t) => t.amount < 0)
        .reduce((acc, t) => {
          const existing = acc.find((e) => e.name === t.category);
          if (existing) {
            existing.value += Math.abs(t.amount);
          } else {
            acc.push({ name: t.category, value: Math.abs(t.amount) });
          }
          return acc;
        }, [] as { name: string; value: number }[])
      : [];

  const totalExpenses = categoryExpenses.reduce(
    (acc, curr) => acc + curr.value,
    0
  );

  const recentTransactions =
    isClient && transactions.length > 0
      ? transactions
        .slice()
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 5)
      : [];

  const budgetStatus =
    isClient && budgets.length > 0
      ? budgets.map((budget) => {
        const expense =
          categoryExpenses.find((e) => e.name === budget.category)?.value ||
          0;
        return {
          ...budget,
          expense,
          progress: (expense / budget.amount) * 100,
          color: generateColor(budget.category),
        };
      })
      : [];

  const budgetCardRef = useRef(null);
  const budgetInView = useInView(budgetCardRef, { once: true, amount: 0.3 });


  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Personal Finance Visualizer</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Overview</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-lg">Total Expenses</span>
                <span className="text-2xl font-bold text-red-600">
                  ₹{totalExpenses.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg">Total Income</span>
                <span className="text-2xl font-bold text-green-600">
                  ₹{totalIncome.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="rounded-2xl shadow-md border border-border">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              {categoryExpenses.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={categoryExpenses}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name}: ${(percent! * 100).toFixed(0)}%`
                        }
                        isAnimationActive={true}
                        animationDuration={500}
                      >
                        {categoryExpenses.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={generateColor(entry.name)}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: '8px',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        }}
                        formatter={(value: number, name: string) => [`₹${value.toFixed(2)}`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Custom Legend */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 w-full px-4">
                    {categoryExpenses.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: generateColor(entry.name) }}
                        />
                        <span className="text-sm text-muted-foreground">{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground text-sm">No category data available</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="rounded-2xl shadow-md border border-border">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-1">
                {recentTransactions.map((t) => (
                  <motion.li
                    key={t.id}
                    className="flex justify-between items-center p-2 rounded-md hover:bg-muted transition-colors"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >

                    <div className="flex flex-col">
                      <span className="text-base">{t.description}</span>
                      <span className="text-xs text-gray-400">{t.date.toLocaleDateString()}</span>
                    </div>
                    <span
                      className={`text-base font-medium ${t.amount < 0 ? 'text-red-600' : 'text-green-600'}`}
                    >
                      ₹{Math.abs(t.amount).toFixed(2)}
                    </span>

                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <Card className="rounded-2xl shadow-md border border-border">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3 mb-6">
                <Dialog open={openAdd} onOpenChange={setOpenAdd}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      Add Transaction
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Transaction</DialogTitle>
                    </DialogHeader>
                    <AddTransactionForm
                      onAddTransaction={handleAddTransaction}
                      categories={categories}
                    />
                  </DialogContent>
                </Dialog>

                <Dialog open={openSetBudget} onOpenChange={setOpenSetBudget}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                      Set Budgets
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Set Budgets</DialogTitle>
                    </DialogHeader>
                    <SetBudgetForm
                      budgets={budgets}
                      onSetBudget={handleSetBudget}
                      categories={categories}
                    />
                  </DialogContent>
                </Dialog>

                <Dialog open={openAddCategory} onOpenChange={setOpenAddCategory}>
                  <DialogTrigger asChild>
                    <Button className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Category</DialogTitle>
                    </DialogHeader>
                    <AddCategoryForm onAddCategory={handleAddCategory} />
                  </DialogContent>
                </Dialog>
              </div>

              <Table className="rounded-lg overflow-hidden border">
                <TableHeader className="bg-muted">
                  <TableRow>
                    <TableHead className="text-muted-foreground">Date</TableHead>
                    <TableHead className="text-muted-foreground">Description</TableHead>
                    <TableHead className="text-muted-foreground">Category</TableHead>
                    <TableHead className="text-right text-muted-foreground">Amount</TableHead>
                    <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((t) => (
                    <motion.tr
                      key={t.id}
                      className="transition-transform hover:scale-[1.01] hover:shadow-sm"
                      whileHover={{ scale: 1.01 }}
                      transition={{ type: 'spring', stiffness: 250 }}
                    >
                      <TableCell>{isClient ? t.date.toLocaleDateString() : ""}</TableCell>
                      <TableCell>{t.description}</TableCell>
                      <TableCell>{t.category}</TableCell>
                      <TableCell
                        className={`text-right font-medium ${t.amount < 0 ? 'text-red-600' : 'text-green-600'
                          }`}
                      >
                        ₹{Math.abs(t.amount).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog
                          open={openEdit === t.id}
                          onOpenChange={(isOpen) => setOpenEdit(isOpen ? t.id : null)}
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="mr-2">
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Transaction</DialogTitle>
                            </DialogHeader>
                            <EditTransactionForm
                              transaction={t}
                              onEditTransaction={handleEditTransaction}
                              categories={categories}
                            />
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteTransaction(t.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Monthly Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyExpenses}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {categories.map((category, index) => (
                      <Bar
                        key={category}
                        dataKey={category}
                        stackId="a"
                        fill={generateColor(category)}
                        isAnimationActive={true}
                        animationDuration={800}
                        animationBegin={index * 100} // staggered animation for each category
                      />
                    ))}
                  </BarChart>

                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            ref={budgetCardRef}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Budget vs. Actual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {budgetStatus &&
                    budgetStatus.map((b) => (
                      <div key={b.category}>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <span>{b.category}</span>
                            {b.progress > 100 && (
                              <AlertTriangle className="w-4 h-4 ml-2 text-red-500" />
                            )}
                          </div>
                          <span>
                            ₹{b.expense.toFixed(2)} / ₹{b.amount.toFixed(2)}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded bg-muted overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: budgetInView ? `${Math.min(b.progress, 100)}%` : 0 }}
                            transition={{ duration: 1.5 }}
                            className="h-2 rounded"
                            style={{ backgroundColor: generateColor(b.category) }}
                          />

                        </div>

                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </div>
    </main>
  );
}
