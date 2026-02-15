import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { type HydratedDocument, Types } from "mongoose";

export type RecurringTransactionDocument = HydratedDocument<RecurringTransactionModel>;

@Schema({ _id: false })
export class RecurrenceScheduleSchema {
  @Prop({ required: true, enum: ["daily", "weekly", "monthly", "yearly"] })
  frequency!: string;

  @Prop({ required: true, min: 1, max: 365 })
  interval!: number;

  @Prop({ type: Number, min: 0, max: 6 })
  dayOfWeek?: number;

  @Prop({ type: Number, min: 1, max: 31 })
  dayOfMonth?: number;

  @Prop({ type: Number, min: 1, max: 12 })
  monthOfYear?: number;
}

@Schema({ collection: "recurring_transactions", timestamps: true })
export class RecurringTransactionModel {
  _id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  workspaceId!: Types.ObjectId;

  @Prop({ required: true, enum: ["income", "expense"] })
  type!: string;

  @Prop({ type: Types.ObjectId, required: true })
  accountId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  categoryId!: Types.ObjectId;

  @Prop({ type: String })
  subcategoryId?: string;

  @Prop({ required: true })
  amount!: number;

  @Prop({ required: true })
  currency!: string;

  @Prop({ type: String, trim: true })
  notes?: string;

  @Prop({ type: RecurrenceScheduleSchema, required: true })
  schedule!: RecurrenceScheduleSchema;

  @Prop({ required: true })
  startDate!: Date;

  @Prop({ type: Date })
  endDate?: Date;

  @Prop({ required: true })
  nextRunDate!: Date;

  @Prop({ type: Date })
  lastRunDate?: Date;

  @Prop({ required: true, default: true })
  isActive!: boolean;

  @Prop({ required: true, default: false })
  isArchived!: boolean;

  @Prop({ type: Types.ObjectId, required: true })
  createdBy!: Types.ObjectId;

  createdAt!: Date;
  updatedAt!: Date;
}

export const RecurringTransactionSchema = SchemaFactory.createForClass(RecurringTransactionModel);

// Indexes for efficient querying
RecurringTransactionSchema.index({ workspaceId: 1 });
RecurringTransactionSchema.index({ workspaceId: 1, isArchived: 1 });
RecurringTransactionSchema.index({ workspaceId: 1, isActive: 1 });
RecurringTransactionSchema.index({ workspaceId: 1, type: 1 });
RecurringTransactionSchema.index({ workspaceId: 1, categoryId: 1 });
RecurringTransactionSchema.index({ workspaceId: 1, accountId: 1 });
RecurringTransactionSchema.index({ workspaceId: 1, nextRunDate: 1, isActive: 1 }); // For finding due items
