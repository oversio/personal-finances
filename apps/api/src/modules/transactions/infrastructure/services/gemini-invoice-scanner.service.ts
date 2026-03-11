import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleGenerativeAI, type GenerativeModel } from "@google/generative-ai";
import type { EnvConfig } from "@/config/env.validation";
import type {
  InvoiceScanInput,
  InvoiceScanResult,
  InvoiceScannerService,
} from "../../application/ports";
import { buildInvoiceScanPrompt } from "../../application/services/invoice-scan-prompt.builder";
import { AiServiceUnavailableError, InvoiceExtractionFailedError } from "../../domain/exceptions";

const SUPPORTED_MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

@Injectable()
export class GeminiInvoiceScannerService implements InvoiceScannerService {
  private readonly logger = new Logger(GeminiInvoiceScannerService.name);
  private readonly model: GenerativeModel | null = null;

  constructor(private readonly config: ConfigService<EnvConfig>) {
    const apiKey = this.config.get<string>("GEMINI_API_KEY");
    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      this.model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: {
          responseMimeType: "application/json",
        },
      });
    }
  }

  supports(mimeType: string): boolean {
    return SUPPORTED_MIME_TYPES.includes(mimeType.toLowerCase());
  }

  async scan(input: InvoiceScanInput): Promise<InvoiceScanResult> {
    if (!this.model) {
      throw new AiServiceUnavailableError("Gemini");
    }

    try {
      const systemPrompt = buildInvoiceScanPrompt(input.expenseCategories);

      const result = await this.model.generateContent([
        {
          inlineData: {
            mimeType: input.mimeType,
            data: input.buffer.toString("base64"),
          },
        },
        { text: systemPrompt },
      ]);

      const response = result.response;
      const text = response.text();

      return this.normalizeResult(JSON.parse(text) as Record<string, unknown>);
    } catch (error) {
      this.logger.error("Gemini invoice scan failed", error);

      if (error instanceof SyntaxError) {
        throw new InvoiceExtractionFailedError(
          "El servicio de IA no devolvió un formato válido. Intenta de nuevo.",
        );
      }

      throw new InvoiceExtractionFailedError();
    }
  }

  private normalizeResult(raw: Record<string, unknown>): InvoiceScanResult {
    return {
      confidence: typeof raw.confidence === "number" ? Math.min(1, Math.max(0, raw.confidence)) : 0,
      amount: typeof raw.amount === "number" && raw.amount > 0 ? raw.amount : null,
      currency: typeof raw.currency === "string" ? raw.currency.toUpperCase() : null,
      date: typeof raw.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw.date) ? raw.date : null,
      vendor: typeof raw.vendor === "string" ? raw.vendor : null,
      description: typeof raw.description === "string" ? raw.description : null,
      categoryId: typeof raw.categoryId === "string" ? raw.categoryId : null,
      subcategoryId: typeof raw.subcategoryId === "string" ? raw.subcategoryId : null,
    };
  }
}
