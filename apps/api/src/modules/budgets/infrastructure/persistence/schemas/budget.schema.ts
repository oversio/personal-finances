import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { type HydratedDocument, Types } from "mongoose";

export type BudgetDocument = HydratedDocument<BudgetModel>;

@Schema({ collection: "budgets", timestamps: true })
export class BudgetModel {
  _id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  workspaceId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  categoryId!: Types.ObjectId;

  @Prop({ type: String })
  subcategoryId?: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true })
  amount!: number;

  @Prop({ required: true, enum: ["weekly", "monthly", "yearly"] })
  period!: string;

  @Prop({ required: true })
  startDate!: Date;

  @Prop({ type: Number })
  alertThreshold?: number;

  @Prop({ required: true, default: false })
  isArchived!: boolean;

  createdAt!: Date;
  updatedAt!: Date;
}

export const BudgetSchema = SchemaFactory.createForClass(BudgetModel);

// Indexes
BudgetSchema.index({ workspaceId: 1 });
BudgetSchema.index({ workspaceId: 1, isArchived: 1 });
BudgetSchema.index({ workspaceId: 1, categoryId: 1 });
// Unique constraint: one active budget per category/subcategory combo
BudgetSchema.index(
  { workspaceId: 1, categoryId: 1, subcategoryId: 1, isArchived: 1 },
  {
    unique: true,
    partialFilterExpression: { isArchived: false },
  },
);
