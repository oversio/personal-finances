import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type WorkspaceInvitationDocument = HydratedDocument<WorkspaceInvitationModel>;

@Schema({ collection: "workspace_invitations", timestamps: false })
export class WorkspaceInvitationModel {
  _id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  workspaceId!: Types.ObjectId;

  @Prop({ required: true, lowercase: true })
  email!: string;

  @Prop({ required: true, enum: ["owner", "admin", "member"] })
  role!: string;

  @Prop({ required: true })
  token!: string;

  @Prop({ required: true })
  expiresAt!: Date;

  @Prop({ type: Types.ObjectId, required: true })
  invitedBy!: Types.ObjectId;

  @Prop({ required: true, default: () => new Date() })
  createdAt!: Date;

  @Prop({ type: Date })
  acceptedAt?: Date;

  @Prop({ type: Date })
  revokedAt?: Date;

  @Prop({ type: Types.ObjectId })
  acceptedByUserId?: Types.ObjectId;
}

export const WorkspaceInvitationSchema = SchemaFactory.createForClass(WorkspaceInvitationModel);

// Indexes
WorkspaceInvitationSchema.index({ token: 1 }, { unique: true });
WorkspaceInvitationSchema.index({ workspaceId: 1, email: 1 });
WorkspaceInvitationSchema.index({ expiresAt: 1 });
WorkspaceInvitationSchema.index({ workspaceId: 1, acceptedAt: 1, revokedAt: 1 });
