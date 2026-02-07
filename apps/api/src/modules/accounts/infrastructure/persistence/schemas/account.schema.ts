import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type AccountDocument = HydratedDocument<AccountModel>;

@Schema({ collection: "accounts", timestamps: true })
export class AccountModel {
  _id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  workspaceId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, enum: ["checking", "savings", "credit_card", "cash", "investment"] })
  type!: string;

  @Prop({ required: true })
  currency!: string;

  @Prop({ required: true, default: 0 })
  initialBalance!: number;

  @Prop({ required: true, default: 0 })
  currentBalance!: number;

  @Prop({ required: true, default: "#6366F1" })
  color!: string;

  @Prop({ type: String })
  icon?: string;

  @Prop({ required: true, default: false })
  isArchived!: boolean;

  createdAt!: Date;
  updatedAt!: Date;
}

export const AccountSchema = SchemaFactory.createForClass(AccountModel);

// Indexes
AccountSchema.index({ workspaceId: 1 });
AccountSchema.index({ workspaceId: 1, isArchived: 1 });
AccountSchema.index({ workspaceId: 1, name: 1 }, { unique: true });
