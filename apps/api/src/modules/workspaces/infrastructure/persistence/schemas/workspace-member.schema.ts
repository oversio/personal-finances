import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type WorkspaceMemberDocument = HydratedDocument<WorkspaceMemberModel>;

@Schema({ collection: "workspace_members", timestamps: false })
export class WorkspaceMemberModel {
  _id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  workspaceId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, enum: ["owner", "admin", "member", "viewer"] })
  role!: string;

  @Prop({ type: Types.ObjectId })
  invitedBy?: Types.ObjectId;

  @Prop({ required: true, default: () => new Date() })
  invitedAt!: Date;

  @Prop({ type: Date })
  joinedAt?: Date;

  @Prop({ required: true, default: true })
  isActive!: boolean;
}

export const WorkspaceMemberSchema = SchemaFactory.createForClass(WorkspaceMemberModel);

// Indexes
WorkspaceMemberSchema.index({ workspaceId: 1, userId: 1 }, { unique: true });
WorkspaceMemberSchema.index({ userId: 1 });
