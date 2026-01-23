import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { WorkspaceRepository } from "../../../application/ports";
import { Workspace } from "../../../domain/entities";
import { WorkspaceDocument, WorkspaceModel } from "../schemas";

@Injectable()
export class MongooseWorkspaceRepository implements WorkspaceRepository {
  constructor(
    @InjectModel(WorkspaceModel.name)
    private readonly workspaceModel: Model<WorkspaceDocument>,
  ) {}

  async save(workspace: Workspace): Promise<Workspace> {
    const doc = new this.workspaceModel({
      name: workspace.name.value,
      ownerId: new Types.ObjectId(workspace.ownerId.value),
      currency: workspace.currency.value,
      timezone: workspace.timezone,
    });

    const saved = await doc.save();
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Workspace | null> {
    const doc = await this.workspaceModel.findById(id).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findByOwnerId(ownerId: string): Promise<Workspace[]> {
    const docs = await this.workspaceModel
      .find({ ownerId: new Types.ObjectId(ownerId) })
      .exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async update(workspace: Workspace): Promise<Workspace> {
    const doc = await this.workspaceModel
      .findByIdAndUpdate(
        workspace.id!.value,
        {
          name: workspace.name.value,
          currency: workspace.currency.value,
          timezone: workspace.timezone,
        },
        { new: true },
      )
      .exec();

    if (!doc) {
      throw new Error(`Workspace with id ${workspace.id!.value} not found`);
    }

    return this.toDomain(doc);
  }

  async delete(id: string): Promise<void> {
    await this.workspaceModel.findByIdAndDelete(id).exec();
  }

  private toDomain(doc: WorkspaceDocument): Workspace {
    return Workspace.create(
      doc._id.toString(),
      doc.name,
      doc.ownerId.toString(),
      doc.currency,
      doc.timezone,
      doc.createdAt,
      doc.updatedAt,
    );
  }
}
