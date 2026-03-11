import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OpenAI from "openai";
import type { EnvConfig } from "@/config/env.validation";
import type {
  InvoiceScanInput,
  InvoiceScanResult,
  InvoiceScannerService,
} from "../../application/ports";
import {
  buildInvoiceScanPrompt,
  INVOICE_SCAN_USER_MESSAGE,
} from "../../application/services/invoice-scan-prompt.builder";
import { AiServiceUnavailableError, InvoiceExtractionFailedError } from "../../domain/exceptions";

const SUPPORTED_MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

@Injectable()
export class OpenAiInvoiceScannerService implements InvoiceScannerService {
  private readonly logger = new Logger(OpenAiInvoiceScannerService.name);
  private readonly client: OpenAI | null;

  constructor(private readonly config: ConfigService<EnvConfig>) {
    const apiKey = this.config.get<string>("OPENAI_API_KEY");
    this.client = apiKey ? new OpenAI({ apiKey }) : null;
  }

  supports(mimeType: string): boolean {
    return SUPPORTED_MIME_TYPES.includes(mimeType.toLowerCase());
  }

  async scan(input: InvoiceScanInput): Promise<InvoiceScanResult> {
    if (!this.client) {
      throw new AiServiceUnavailableError("OpenAI");
    }

    try {
      const base64Image = input.buffer.toString("base64");
      const dataUrl = `data:${input.mimeType};base64,${base64Image}`;
      const systemPrompt = buildInvoiceScanPrompt(input.expenseCategories);

      const response = await this.client.chat.completions.create({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: dataUrl,
                  detail: "high",
                },
              },
              {
                type: "text",
                text: INVOICE_SCAN_USER_MESSAGE,
              },
            ],
          },
        ],
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new InvoiceExtractionFailedError("No se recibió respuesta del servicio de IA.");
      }

      return this.normalizeResult(JSON.parse(content) as Record<string, unknown>);
    } catch (error) {
      this.logger.error("OpenAI invoice scan failed", error);

      if (error instanceof InvoiceExtractionFailedError) {
        throw error;
      }

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
