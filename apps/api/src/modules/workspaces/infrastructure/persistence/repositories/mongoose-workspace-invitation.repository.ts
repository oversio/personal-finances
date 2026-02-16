import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import type { WorkspaceInvitationRepository } from "../../../application/ports";
import { WorkspaceInvitation } from "../../../domain/entities";
import { WorkspaceInvitationDocument, WorkspaceInvitationModel } from "../schemas";

@Injectable()
export class MongooseWorkspaceInvitationRepository implements WorkspaceInvitationRepository {
  constructor(
    @InjectModel(WorkspaceInvitationModel.name)
    private readonly invitationModel: Model<WorkspaceInvitationDocument>,
  ) {}

  async save(invitation: WorkspaceInvitation): Promise<WorkspaceInvitation> {
    const doc = new this.invitationModel({
      workspaceId: new Types.ObjectId(invitation.workspaceId.value),
      email: invitation.email,
      role: invitation.role.value,
      token: invitation.token,
      expiresAt: invitation.expiresAt,
      invitedBy: new Types.ObjectId(invitation.invitedBy.value),
      createdAt: invitation.createdAt,
      acceptedAt: invitation.acceptedAt,
      revokedAt: invitation.revokedAt,
      acceptedByUserId: invitation.acceptedByUserId
        ? new Types.ObjectId(invitation.acceptedByUserId.value)
        : undefined,
    });

    const saved = await doc.save();
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<WorkspaceInvitation | null> {
    const doc = await this.invitationModel.findById(id).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findByToken(token: string): Promise<WorkspaceInvitation | null> {
    const doc = await this.invitationModel.findOne({ token }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findByWorkspaceAndEmail(
    workspaceId: string,
    email: string,
  ): Promise<WorkspaceInvitation | null> {
    const doc = await this.invitationModel
      .findOne({
        workspaceId: new Types.ObjectId(workspaceId),
        email: email.toLowerCase(),
        acceptedAt: null,
        revokedAt: null,
      })
      .exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findPendingByWorkspaceId(workspaceId: string): Promise<WorkspaceInvitation[]> {
    const docs = await this.invitationModel
      .find({
        workspaceId: new Types.ObjectId(workspaceId),
        acceptedAt: null,
        revokedAt: null,
      })
      .sort({ createdAt: -1 })
      .exec();
    return docs.map(doc => this.toDomain(doc));
  }

  async update(invitation: WorkspaceInvitation): Promise<WorkspaceInvitation> {
    const doc = await this.invitationModel
      .findByIdAndUpdate(
        invitation.id!.value,
        {
          acceptedAt: invitation.acceptedAt,
          revokedAt: invitation.revokedAt,
          acceptedByUserId: invitation.acceptedByUserId
            ? new Types.ObjectId(invitation.acceptedByUserId.value)
            : undefined,
        },
        { new: true },
      )
      .exec();

    if (!doc) {
      throw new Error(`WorkspaceInvitation with id ${invitation.id!.value} not found`);
    }

    return this.toDomain(doc);
  }

  async delete(id: string): Promise<void> {
    await this.invitationModel.findByIdAndDelete(id).exec();
  }

  private toDomain(doc: WorkspaceInvitationDocument): WorkspaceInvitation {
    return WorkspaceInvitation.fromPrimitives({
      id: doc._id.toString(),
      workspaceId: doc.workspaceId.toString(),
      email: doc.email,
      role: doc.role,
      token: doc.token,
      expiresAt: doc.expiresAt,
      invitedBy: doc.invitedBy.toString(),
      createdAt: doc.createdAt,
      acceptedAt: doc.acceptedAt,
      revokedAt: doc.revokedAt,
      acceptedByUserId: doc.acceptedByUserId?.toString(),
    });
  }
}
