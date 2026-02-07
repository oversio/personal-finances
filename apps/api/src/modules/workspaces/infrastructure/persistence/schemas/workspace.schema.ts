import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type WorkspaceDocument = HydratedDocument<WorkspaceModel>;

@Schema({ collection: "workspaces", timestamps: true })
export class WorkspaceModel {
  _id!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ type: Types.ObjectId, required: true })
  ownerId!: Types.ObjectId;

  @Prop({ required: true, default: "USD" })
  currency!: string;

  @Prop({ type: String })
  timezone?: string;

  @Prop({ required: true, default: false })
  isDefault!: boolean;

  createdAt!: Date;
  updatedAt!: Date;
}

export const WorkspaceSchema = SchemaFactory.createForClass(WorkspaceModel);

// Indexes
WorkspaceSchema.index({ ownerId: 1 });
