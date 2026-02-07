import type { CategoryTypeValue } from "../../domain/value-objects";

export interface DefaultSubcategory {
  name: string;
  icon?: string;
}

export interface DefaultCategory {
  name: string;
  type: CategoryTypeValue;
  icon?: string;
  color?: string;
  subcategories: DefaultSubcategory[];
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  // Expense categories
  {
    name: "Food & Dining",
    type: "expense",
    icon: "utensils",
    color: "#EF4444",
    subcategories: [
      { name: "Groceries", icon: "shopping-cart" },
      { name: "Restaurants", icon: "utensils" },
      { name: "Coffee & Snacks", icon: "coffee" },
      { name: "Delivery", icon: "truck" },
    ],
  },
  {
    name: "Transportation",
    type: "expense",
    icon: "car",
    color: "#F59E0B",
    subcategories: [
      { name: "Gas", icon: "fuel" },
      { name: "Public Transit", icon: "bus" },
      { name: "Parking", icon: "parking" },
      { name: "Maintenance", icon: "wrench" },
      { name: "Ride Sharing", icon: "car" },
    ],
  },
  {
    name: "Housing",
    type: "expense",
    icon: "home",
    color: "#10B981",
    subcategories: [
      { name: "Rent", icon: "key" },
      { name: "Mortgage", icon: "building" },
      { name: "Utilities", icon: "zap" },
      { name: "Internet & Phone", icon: "wifi" },
      { name: "Repairs", icon: "hammer" },
    ],
  },
  {
    name: "Healthcare",
    type: "expense",
    icon: "heart-pulse",
    color: "#EC4899",
    subcategories: [
      { name: "Doctor Visits", icon: "stethoscope" },
      { name: "Medication", icon: "pill" },
      { name: "Insurance", icon: "shield" },
      { name: "Gym", icon: "dumbbell" },
    ],
  },
  {
    name: "Entertainment",
    type: "expense",
    icon: "gamepad",
    color: "#8B5CF6",
    subcategories: [
      { name: "Streaming Services", icon: "tv" },
      { name: "Movies & Events", icon: "ticket" },
      { name: "Games", icon: "gamepad" },
      { name: "Hobbies", icon: "palette" },
    ],
  },
  {
    name: "Shopping",
    type: "expense",
    icon: "shopping-bag",
    color: "#06B6D4",
    subcategories: [
      { name: "Clothing", icon: "shirt" },
      { name: "Electronics", icon: "smartphone" },
      { name: "Home & Garden", icon: "sofa" },
      { name: "Personal Care", icon: "sparkles" },
    ],
  },
  {
    name: "Education",
    type: "expense",
    icon: "graduation-cap",
    color: "#0EA5E9",
    subcategories: [
      { name: "Courses", icon: "book-open" },
      { name: "Books", icon: "book" },
      { name: "Supplies", icon: "pencil" },
      { name: "Tuition", icon: "graduation-cap" },
    ],
  },
  {
    name: "Personal",
    type: "expense",
    icon: "user",
    color: "#6366F1",
    subcategories: [
      { name: "Gifts", icon: "gift" },
      { name: "Donations", icon: "heart" },
      { name: "Subscriptions", icon: "repeat" },
      { name: "Other", icon: "more-horizontal" },
    ],
  },

  // Income categories
  {
    name: "Salary",
    type: "income",
    icon: "briefcase",
    color: "#22C55E",
    subcategories: [
      { name: "Regular Pay", icon: "wallet" },
      { name: "Bonus", icon: "gift" },
      { name: "Overtime", icon: "clock" },
    ],
  },
  {
    name: "Freelance",
    type: "income",
    icon: "laptop",
    color: "#14B8A6",
    subcategories: [
      { name: "Consulting", icon: "users" },
      { name: "Projects", icon: "folder" },
      { name: "Commissions", icon: "percent" },
    ],
  },
  {
    name: "Investments",
    type: "income",
    icon: "trending-up",
    color: "#3B82F6",
    subcategories: [
      { name: "Dividends", icon: "coins" },
      { name: "Interest", icon: "percent" },
      { name: "Capital Gains", icon: "trending-up" },
    ],
  },
  {
    name: "Other Income",
    type: "income",
    icon: "plus-circle",
    color: "#A855F7",
    subcategories: [
      { name: "Refunds", icon: "rotate-ccw" },
      { name: "Gifts Received", icon: "gift" },
      { name: "Rental Income", icon: "home" },
      { name: "Miscellaneous", icon: "more-horizontal" },
    ],
  },
];
