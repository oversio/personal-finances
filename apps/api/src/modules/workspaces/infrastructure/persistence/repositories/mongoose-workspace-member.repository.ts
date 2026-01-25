import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { WorkspaceMemberRepository } from "../../../application/ports";
import { WorkspaceMember } from "../../../domain/entities";
import { WorkspaceMemberDocument, WorkspaceMemberModel } from "../schemas";

@Injectable()
export class MongooseWorkspaceMemberRepository implements WorkspaceMemberRepository {
  constructor(
    @InjectModel(WorkspaceMemberModel.name)
    private readonly memberModel: Model<WorkspaceMemberDocument>,
  ) {}

  async save(member: WorkspaceMember): Promise<WorkspaceMember> {
    const doc = new this.memberModel({
      workspaceId: new Types.ObjectId(member.workspaceId.value),
      userId: new Types.ObjectId(member.userId.value),
      role: member.role.value,
      invitedBy: member.invitedBy
        ? new Types.ObjectId(member.invitedBy.value)
        : undefined,
      invitedAt: member.invitedAt,
      joinedAt: member.joinedAt,
      isActive: member.isActive,
    });

    const saved = await doc.save();
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<WorkspaceMember | null> {
    const doc = await this.memberModel.findById(id).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findByWorkspaceId(workspaceId: string): Promise<WorkspaceMember[]> {
    const docs = await this.memberModel
      .find({ workspaceId: new Types.ObjectId(workspaceId) })
      .exec();
    return docs.map(doc => this.toDomain(doc));
  }

  async findByUserId(userId: string): Promise<WorkspaceMember[]> {
    const docs = await this.memberModel
      .find({ userId: new Types.ObjectId(userId) })
      .exec();
    return docs.map(doc => this.toDomain(doc));
  }

  async findByWorkspaceAndUser(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceMember | null> {
    const doc = await this.memberModel
      .findOne({
        workspaceId: new Types.ObjectId(workspaceId),
        userId: new Types.ObjectId(userId),
      })
      .exec();
    return doc ? this.toDomain(doc) : null;
  }

  async update(member: WorkspaceMember): Promise<WorkspaceMember> {
    const doc = await this.memberModel
      .findByIdAndUpdate(
        member.id!.value,
        {
          role: member.role.value,
          joinedAt: member.joinedAt,
          isActive: member.isActive,
        },
        { new: true },
      )
      .exec();

    if (!doc) {
      throw new Error(`WorkspaceMember with id ${member.id!.value} not found`);
    }

    return this.toDomain(doc);
  }

  async delete(id: string): Promise<void> {
    await this.memberModel.findByIdAndDelete(id).exec();
  }

  private toDomain(doc: WorkspaceMemberDocument): WorkspaceMember {
    return WorkspaceMember.create(
      doc._id.toString(),
      doc.workspaceId.toString(),
      doc.userId.toString(),
      doc.role,
      doc.invitedBy?.toString(),
      doc.invitedAt,
      doc.joinedAt,
      doc.isActive,
    );
  }
}
