/**
 * Normalizes a string for flexible matching.
 * - Trims whitespace
 * - Converts to lowercase
 * - Removes diacritics (accents)
 *
 * Examples:
 * - "Alimentación" → "alimentacion"
 * - " ALIMENTACIÓN " → "alimentacion"
 * - "Alimentacion" → "alimentacion"
 */
export function normalizeForMatch(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Compares two strings using flexible matching.
 */
export function matchesFlexibly(a: string, b: string): boolean {
  return normalizeForMatch(a) === normalizeForMatch(b);
}
