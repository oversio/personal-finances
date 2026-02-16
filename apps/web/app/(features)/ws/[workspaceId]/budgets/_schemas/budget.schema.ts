import { z } from "zod";

const BUDGET_PERIODS = ["weekly", "monthly", "yearly"] as const;

export const createBudgetSchema = z.object({
  categoryId: z.string().min(1, { message: "Selecciona una categoría" }),
  subcategoryId: z.string().optional(),
  name: z
    .string()
    .min(1, { message: "El nombre del presupuesto es requerido" })
    .max(100, { message: "El nombre debe tener menos de 100 caracteres" }),
  amount: z.number().positive({ message: "El monto debe ser mayor a 0" }),
  period: z.enum(BUDGET_PERIODS, { message: "Selecciona un período" }),
  startDate: z.date({ message: "Selecciona una fecha de inicio" }),
  alertThreshold: z.number().min(1).max(100).optional(),
});

export type CreateBudgetFormData = z.infer<typeof createBudgetSchema>;

export const updateBudgetSchema = z.object({
  name: z
    .string()
    .min(1, { message: "El nombre del presupuesto es requerido" })
    .max(100, { message: "El nombre debe tener menos de 100 caracteres" })
    .optional(),
  amount: z.number().positive({ message: "El monto debe ser mayor a 0" }).optional(),
  period: z.enum(BUDGET_PERIODS, { message: "Selecciona un período" }).optional(),
  alertThreshold: z.number().min(1).max(100).nullish(),
});

export type UpdateBudgetFormData = z.infer<typeof updateBudgetSchema>;

export const BUDGET_PERIOD_LABELS: Record<(typeof BUDGET_PERIODS)[number], string> = {
  weekly: "Semanal",
  monthly: "Mensual",
  yearly: "Anual",
};
