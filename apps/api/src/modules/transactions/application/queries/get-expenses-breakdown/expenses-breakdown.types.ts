/**
 * Application layer types for expenses breakdown query.
 * These types define the shape of the query response.
 * Infrastructure DTOs can import and extend these as needed.
 */

export interface MonthlyExpense {
  month: number;
  total: number;
}

export interface SubcategoryBreakdown {
  subcategoryId: string;
  subcategoryName: string;
  months: MonthlyExpense[];
  yearTotal: number;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  months: MonthlyExpense[];
  yearTotal: number;
  subcategories: SubcategoryBreakdown[];
}

export interface ExpensesBreakdownResponse {
  year: number;
  categories: CategoryBreakdown[];
  monthlyTotals: MonthlyExpense[];
  grandTotal: number;
}
