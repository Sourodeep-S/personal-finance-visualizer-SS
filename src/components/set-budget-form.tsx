"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Budget } from "@/lib/budget";

const formSchema = z.object({
  budgets: z.array(
    z.object({
      category: z.string(),
      amount: z.coerce.number(),
    })
  ),
});

interface SetBudgetFormProps {
  budgets: Budget[];
  onSetBudget: (category: string, amount: number) => void;
  categories: string[];
}

export function SetBudgetForm({
  budgets,
  onSetBudget,
  categories,
}: SetBudgetFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      budgets: categories.map((category) => ({
        category,
        amount: budgets.find((b) => b.category === category)?.amount || 0,
      })),
    },
  });

  return (
    <Form {...form}>
      <form className="space-y-8">
        {form.getValues("budgets").map((budget, index) => (
          <FormField
            key={budget.category}
            control={form.control}
            name={`budgets.${index}.amount`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{budget.category}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => {
                      const amount = parseFloat(e.target.value) || 0;
                      field.onChange(amount);
                      onSetBudget(budget.category, amount);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </form>
    </Form>
  );
}