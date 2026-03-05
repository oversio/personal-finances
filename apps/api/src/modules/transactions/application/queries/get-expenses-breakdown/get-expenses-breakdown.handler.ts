import { Inject, Injectable } from "@nestjs/common";
import {
  CATEGORY_REPOSITORY,
  type CategoryRepository,
} from "@/modules/categories/application/ports";
import { TRANSACTION_REPOSITORY, type TransactionRepository } from "../../ports";
import type {
  CategoryBreakdown,
  ExpensesBreakdownResponse,
  MonthlyExpense,
  SubcategoryBreakdown,
} from "./expenses-breakdown.types";
import { GetExpensesBreakdownQuery } from "./get-expenses-breakdown.query";

@Injectable()
export class GetExpensesBreakdownHandler {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(query: GetExpensesBreakdownQuery): Promise<ExpensesBreakdownResponse> {
    // 1. Get raw aggregation data from repository
    const rawData = await this.transactionRepository.aggregateExpensesByMonth(
      query.workspaceId,
      query.year,
    );

    // 2. Get all categories for the workspace to enrich with names and colors
    const categories = await this.categoryRepository.findByWorkspaceId(query.workspaceId);

    // 3. Build lookup maps for O(1) access
    const categoryMap = new Map(
      categories.map(c => {
        const primitives = c.toPrimitives();
        return [primitives.id!, primitives];
      }),
    );

    // 4. Group raw data by category, then by subcategory
    const categoryGroups = new Map<
      string,
      {
        categoryId: string;
        subcategories: Map<string | null, { month: number; total: number }[]>;
      }
    >();

    for (const item of rawData) {
      if (!categoryGroups.has(item.categoryId)) {
        categoryGroups.set(item.categoryId, {
          categoryId: item.categoryId,
          subcategories: new Map(),
        });
      }

      const group = categoryGroups.get(item.categoryId)!;
      const subcatKey = item.subcategoryId;

      if (!group.subcategories.has(subcatKey)) {
        group.subcategories.set(subcatKey, []);
      }

      group.subcategories.get(subcatKey)!.push({
        month: item.month,
        total: item.total,
      });
    }

    // 5. Transform into response structure
    const categoryBreakdowns: CategoryBreakdown[] = [];
    const monthlyGrandTotals = new Map<number, number>();

    for (const [categoryId, group] of categoryGroups) {
      const categoryData = categoryMap.get(categoryId);

      if (!categoryData) {
        // Skip if category was deleted
        continue;
      }

      // Build subcategory breakdowns
      const subcategoryBreakdowns: SubcategoryBreakdown[] = [];
      const categoryMonthlyTotals = new Map<number, number>();

      for (const [subcatId, monthlyData] of group.subcategories) {
        if (subcatId === null) {
          // Transactions without subcategory - add directly to category totals
          for (const { month, total } of monthlyData) {
            categoryMonthlyTotals.set(month, (categoryMonthlyTotals.get(month) ?? 0) + total);
          }
        } else {
          // Find subcategory name
          const subcategory = categoryData.subcategories.find(s => s.id === subcatId);
          const subcategoryName = subcategory?.name ?? "Sin subcategoría";

          const months: MonthlyExpense[] = monthlyData.map(({ month, total }) => ({
            month,
            total,
          }));

          const yearTotal = monthlyData.reduce((sum, { total }) => sum + total, 0);

          subcategoryBreakdowns.push({
            subcategoryId: subcatId,
            subcategoryName,
            months,
            yearTotal,
          });

          // Add to category monthly totals
          for (const { month, total } of monthlyData) {
            categoryMonthlyTotals.set(month, (categoryMonthlyTotals.get(month) ?? 0) + total);
          }
        }
      }

      // Sort subcategories by name
      subcategoryBreakdowns.sort((a, b) => a.subcategoryName.localeCompare(b.subcategoryName));

      // Build category months array
      const categoryMonths: MonthlyExpense[] = Array.from(categoryMonthlyTotals.entries()).map(
        ([month, total]) => ({ month, total }),
      );

      const categoryYearTotal = categoryMonths.reduce((sum, { total }) => sum + total, 0);

      // Add to grand totals
      for (const { month, total } of categoryMonths) {
        monthlyGrandTotals.set(month, (monthlyGrandTotals.get(month) ?? 0) + total);
      }

      categoryBreakdowns.push({
        categoryId,
        categoryName: categoryData.name,
        categoryColor: categoryData.color,
        months: categoryMonths,
        yearTotal: categoryYearTotal,
        subcategories: subcategoryBreakdowns,
      });
    }

    // Sort categories by name
    categoryBreakdowns.sort((a, b) => a.categoryName.localeCompare(b.categoryName));

    // Build monthly totals array
    const monthlyTotals: MonthlyExpense[] = Array.from(monthlyGrandTotals.entries())
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => a.month - b.month);

    const grandTotal = monthlyTotals.reduce((sum, { total }) => sum + total, 0);

    return {
      year: query.year,
      categories: categoryBreakdowns,
      monthlyTotals,
      grandTotal,
    };
  }
}
