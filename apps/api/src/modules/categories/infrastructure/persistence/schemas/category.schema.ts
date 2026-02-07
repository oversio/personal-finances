import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type CategoryDocument = HydratedDocument<CategoryModel>;

@Schema({ _id: false })
class SubcategoryModel {
  @Prop({ required: true })
  id!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ type: String })
  icon?: string;
}

const SubcategorySchema = SchemaFactory.createForClass(SubcategoryModel);

@Schema({ collection: "categories", timestamps: true })
export class CategoryModel {
  _id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  workspaceId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, enum: ["income", "expense"] })
  type!: string;

  @Prop({ type: [SubcategorySchema], default: [] })
  subcategories!: SubcategoryModel[];

  @Prop({ type: String })
  icon?: string;

  @Prop({ required: true, default: "#6366F1" })
  color!: string;

  @Prop({ required: true, default: false })
  isArchived!: boolean;

  createdAt!: Date;
  updatedAt!: Date;
}

export const CategorySchema = SchemaFactory.createForClass(CategoryModel);

// Indexes
CategorySchema.index({ workspaceId: 1 });
CategorySchema.index({ workspaceId: 1, isArchived: 1 });
CategorySchema.index({ workspaceId: 1, name: 1, type: 1 }, { unique: true });
CategorySchema.index({ workspaceId: 1, type: 1 });
