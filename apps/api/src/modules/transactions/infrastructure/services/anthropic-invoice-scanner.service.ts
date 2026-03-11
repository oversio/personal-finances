import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Anthropic from "@anthropic-ai/sdk";
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

type AnthropicMediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

@Injectable()
export class AnthropicInvoiceScannerService implements InvoiceScannerService {
  private readonly logger = new Logger(AnthropicInvoiceScannerService.name);
  private readonly client: Anthropic | null;

  constructor(private readonly config: ConfigService<EnvConfig>) {
    const apiKey = this.config.get<string>("ANTHROPIC_API_KEY");
    this.client = apiKey ? new Anthropic({ apiKey }) : null;
  }

  supports(mimeType: string): boolean {
    return SUPPORTED_MIME_TYPES.includes(mimeType.toLowerCase());
  }

  async scan(input: InvoiceScanInput): Promise<InvoiceScanResult> {
    if (!this.client) {
      throw new AiServiceUnavailableError("Anthropic");
    }

    try {
      const base64Image = input.buffer.toString("base64");
      const systemPrompt = buildInvoiceScanPrompt(input.expenseCategories);

      const response = await this.client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: input.mimeType as AnthropicMediaType,
                  data: base64Image,
                },
              },
              {
                type: "text",
                text: INVOICE_SCAN_USER_MESSAGE,
              },
            ],
          },
        ],
      });

      const textBlock = response.content.find(block => block.type === "text");
      if (!textBlock || textBlock.type !== "text") {
        throw new InvoiceExtractionFailedError("No se recibió respuesta del servicio de IA.");
      }

      const jsonContent = this.extractJson(textBlock.text);
      return this.normalizeResult(JSON.parse(jsonContent) as Record<string, unknown>);
    } catch (error) {
      this.logger.error("Anthropic invoice scan failed", error);

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

  private extractJson(text: string): string {
    // Try to extract JSON from markdown code blocks if present
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      return codeBlockMatch[1].trim();
    }

    // Otherwise assume the entire response is JSON
    return text.trim();
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
