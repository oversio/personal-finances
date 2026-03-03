import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import type {
  CreateImportSessionData,
  ImportSession,
  ImportSessionRepository,
} from "../../../application/ports";
import { ImportSessionDocument, ImportSessionModel } from "../schemas";

@Injectable()
export class MongooseImportSessionRepository implements ImportSessionRepository {
  constructor(
    @InjectModel(ImportSessionModel.name)
    private readonly importSessionModel: Model<ImportSessionDocument>,
  ) {}

  async create(data: CreateImportSessionData): Promise<ImportSession> {
    const doc = new this.importSessionModel({
      workspaceId: new Types.ObjectId(data.workspaceId),
      userId: new Types.ObjectId(data.userId),
      fileName: data.fileName,
      rows: data.rows,
      summary: data.summary,
      categoriesToCreate: data.categoriesToCreate,
    });

    const saved = await doc.save();
    return this.toPlain(saved);
  }

  async findById(id: string): Promise<ImportSession | null> {
    try {
      const doc = await this.importSessionModel.findById(id).exec();
      return doc ? this.toPlain(doc) : null;
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<void> {
    await this.importSessionModel.findByIdAndDelete(id).exec();
  }

  private toPlain(doc: ImportSessionDocument): ImportSession {
    return {
      id: doc._id.toString(),
      workspaceId: doc.workspaceId.toString(),
      userId: doc.userId.toString(),
      fileName: doc.fileName,
      rows: doc.rows,
      summary: doc.summary,
      categoriesToCreate: doc.categoriesToCreate ?? [],
      createdAt: doc.createdAt,
    };
  }
}
