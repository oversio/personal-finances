import "@tanstack/react-query";

declare module "@tanstack/react-query" {
  interface Register {
    queryMeta: CustomQueryMeta;
    mutationMeta: CustomMutationMeta;
  }
}

interface CustomQueryMeta extends Record<string, unknown> {
  /**
   * If true, skips the global error handler toast.
   * Use when the component handles errors locally.
   */
  skipGlobalErrorHandler?: boolean;
}

interface CustomMutationMeta extends Record<string, unknown> {
  /**
   * If true, skips the global error handler toast.
   * Use when the component handles errors locally.
   */
  skipGlobalErrorHandler?: boolean;

  /**
   * Key used to look up success toast message.
   * The translation key format is: `toast.mutation.${i18nToastKey}.success`
   *
   * @example
   * // With i18nToastKey: "categories"
   * // Looks up: "toast.mutation.categories.success"
   */
  i18nToastKey?: string;
}
