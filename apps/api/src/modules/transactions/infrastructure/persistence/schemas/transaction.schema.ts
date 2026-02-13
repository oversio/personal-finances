import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { type HydratedDocument, Types } from "mongoose";

export type TransactionDocument = HydratedDocument<TransactionModel>;

@Schema({ collection: "transactions", timestamps: true })
export class TransactionModel {
  _id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  workspaceId!: Types.ObjectId;

  @Prop({ required: true, enum: ["income", "expense", "transfer"] })
  type!: string;

  @Prop({ type: Types.ObjectId, required: true })
  accountId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  toAccountId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  categoryId?: Types.ObjectId;

  @Prop({ type: String })
  subcategoryId?: string;

  @Prop({ required: true })
  amount!: number;

  @Prop({ required: true })
  currency!: string;

  @Prop({ type: String, trim: true })
  notes?: string;

  @Prop({ required: true })
  date!: Date;

  @Prop({ type: Types.ObjectId, required: true })
  createdBy!: Types.ObjectId;

  @Prop({ required: true, default: false })
  isArchived!: boolean;

  createdAt!: Date;
  updatedAt!: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(TransactionModel);

// Indexes for efficient querying
TransactionSchema.index({ workspaceId: 1 });
TransactionSchema.index({ workspaceId: 1, isArchived: 1 });
TransactionSchema.index({ workspaceId: 1, accountId: 1 });
TransactionSchema.index({ workspaceId: 1, categoryId: 1 });
TransactionSchema.index({ workspaceId: 1, type: 1 });
TransactionSchema.index({ workspaceId: 1, date: -1 }); // For date sorting (newest first)
TransactionSchema.index({ workspaceId: 1, date: 1, isArchived: 1 }); // Common filter combo
