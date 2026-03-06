import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { type HydratedDocument, Types } from "mongoose";
import type { CategoryToCreate, ImportRow } from "../../../application/ports";

export type ImportSessionDocument = HydratedDocument<ImportSessionModel>;

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
