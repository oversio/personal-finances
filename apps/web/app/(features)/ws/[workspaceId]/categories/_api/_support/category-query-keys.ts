export const CATEGORY_QUERY_KEYS = {
  list: "categories-list",
  detail: "categories-detail",
  create: "categories-create",
  update: "categories-update",
  delete: "categories-delete",
  addSubcategory: "categories-add-subcategory",
  updateSubcategory: "categories-update-subcategory",
  removeSubcategory: "categories-remove-subcategory",
} as const;

export type CategoryQueryKey = (typeof CATEGORY_QUERY_KEYS)[keyof typeof CATEGORY_QUERY_KEYS];
