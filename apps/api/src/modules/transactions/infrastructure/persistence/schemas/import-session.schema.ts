import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { type HydratedDocument, Types } from "mongoose";

export type ImportSessionDocument = HydratedDocument<ImportSessionModel>;

export interface CategoryToCreate {
  name: string;
  type: "income" | "expense";
  subcategories: string[];
}

export interface ImportRowData {
  type: string;
  accountName: string;
  toAccountName?: string;
  categoryName?: string;
  subcategoryName?: string;
  amount: number;
  currency: string;
  notes?: string;
  date: string;
}

export interface ImportRowError {
  field: string;
  message: string;
  code: string;
}

export interface ImportRow {
  rowNumber: number;
  status: "valid" | "invalid" | "warning";
  data: ImportRowData;
  resolvedIds: {
    accountId?: string;
    toAccountId?: string;
    categoryId?: string;
    subcategoryId?: string;
  };
  errors: ImportRowError[];
}

@Schema({ collection: "import_sessions", timestamps: true })
export class ImportSessionModel {
  _id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  workspaceId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  fileName!: string;

  @Prop({ type: [Object], required: true })
  rows!: ImportRow[];

  @Prop({ type: Object, required: true })
  summary!: {
    total: number;
    valid: number;
    invalid: number;
    warnings: number;
  };

  @Prop({ type: [Object], default: [] })
  categoriesToCreate!: CategoryToCreate[];

  createdAt!: Date;
  updatedAt!: Date;
}

export const ImportSessionSchema = SchemaFactory.createForClass(ImportSessionModel);

// TTL index: sessions expire after 15 minutes
ImportSessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 900 });

// Query index
ImportSessionSchema.index({ workspaceId: 1, userId: 1 });
