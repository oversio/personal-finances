import type { CategoryOption } from "../ports";

const JSON_RESPONSE_FORMAT = `{
  "confidence": <número entre 0 y 1 indicando qué tan seguro estás de la extracción>,
  "amount": <monto numérico sin símbolos de moneda, null si no se encuentra>,
  "currency": <código ISO de moneda (USD, CLP, EUR, etc.), null si no se detecta>,
  "date": <fecha en formato YYYY-MM-DD, null si no se encuentra>,
  "vendor": <nombre del vendedor/comercio, null si no se encuentra>,
  "description": <descripción breve del concepto principal, null si no hay información>,
  "categoryId": <ID de la categoría más apropiada de la lista proporcionada, null si ninguna aplica>,
  "subcategoryId": <ID de la subcategoría si aplica, null si no hay subcategoría adecuada>
}`;

const EXTRACTION_RULES = `Reglas:
- Responde SOLO con el JSON, sin markdown ni explicaciones
- Los montos deben ser números positivos
- Las fechas deben estar en formato ISO (YYYY-MM-DD)
- Si no puedes identificar algo con confianza, usa null
- Para categoryId y subcategoryId usa SOLO los IDs proporcionados en la lista de categorías
- La confianza debe reflejar qué tan legible y clara es la información`;

function formatCategoryList(categories: CategoryOption[]): string {
  return categories
    .map(cat => {
      const subcats =
        cat.subcategories.length > 0
          ? ` (subcategorías: ${cat.subcategories.map(s => `"${s.name}" id:${s.id}`).join(", ")})`
          : "";
      return `  - "${cat.name}" id:${cat.id}${subcats}`;
    })
    .join("\n");
}

export function buildInvoiceScanPrompt(categories: CategoryOption[]): string {
  const categoryList = formatCategoryList(categories);

  return `Eres un experto en análisis de facturas y boletas de GASTOS. Analiza la imagen y extrae la información en formato JSON.

CATEGORÍAS DISPONIBLES (usa SOLO estos IDs):
${categoryList}

Responde con este formato JSON exacto:
${JSON_RESPONSE_FORMAT}

${EXTRACTION_RULES}`;
}

export const INVOICE_SCAN_USER_MESSAGE =
  "Analiza esta factura o boleta de gasto y extrae la información solicitada.";
