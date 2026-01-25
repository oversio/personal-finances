import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type UserDocument = HydratedDocument<UserModel>;

@Schema({ collection: "users", timestamps: true })
export class UserModel {
  _id!: Types.ObjectId;

  @Prop({ required: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ type: String })
  passwordHash?: string;

  @Prop({ required: true, enum: ["local", "google"], default: "local" })
  provider!: string;

  @Prop({ type: String })
  providerId?: string;

  @Prop({ required: true, default: false })
  isEmailVerified!: boolean;

  @Prop({ type: String })
  picture?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ provider: 1, providerId: 1 }, { sparse: true });
