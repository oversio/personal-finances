import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ScanInvoiceResponseDto {
  @ApiProperty({
    description: "Confidence score of the extraction (0-1)",
    minimum: 0,
    maximum: 1,
    example: 0.85,
  })
  confidence!: number;

  @ApiPropertyOptional({
    description: "Extracted amount",
    example: 150.5,
    nullable: true,
  })
  amount!: number | null;

  @ApiPropertyOptional({
    description: "Detected currency code (ISO)",
    example: "USD",
    nullable: true,
  })
  currency!: string | null;

  @ApiPropertyOptional({
    description: "Extracted date in ISO format (YYYY-MM-DD)",
    example: "2024-01-15",
    nullable: true,
  })
  date!: string | null;

  @ApiPropertyOptional({
    description: "Vendor/merchant name",
    example: "Supermercado Líder",
    nullable: true,
  })
  vendor!: string | null;

  @ApiPropertyOptional({
    description: "Transaction description",
    example: "Compra de víveres",
    nullable: true,
  })
  description!: string | null;

  @ApiPropertyOptional({
    description: "Matched category ID from workspace",
    example: "507f1f77bcf86cd799439011",
    nullable: true,
  })
  categoryId!: string | null;

  @ApiPropertyOptional({
    description: "Matched subcategory ID",
    example: "507f1f77bcf86cd799439012",
    nullable: true,
  })
  subcategoryId!: string | null;
}
