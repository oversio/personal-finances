import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { RefreshTokenRepository } from "../../../application/ports";
import { RefreshToken } from "../../../domain/entities";
import { RefreshTokenDocument, RefreshTokenModel } from "../schemas";

@Injectable()
export class MongooseRefreshTokenRepository implements RefreshTokenRepository {
  constructor(
    @InjectModel(RefreshTokenModel.name)
    private readonly tokenModel: Model<RefreshTokenDocument>,
  ) {}

  async save(token: RefreshToken): Promise<RefreshToken> {
    const doc = new this.tokenModel({
      userId: new Types.ObjectId(token.userId.value),
      token: token.token,
      expiresAt: token.expiresAt,
      createdAt: token.createdAt,
      revokedAt: token.revokedAt,
      userAgent: token.userAgent,
      ipAddress: token.ipAddress,
    });

    const saved = await doc.save();
    return this.toDomain(saved);
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const doc = await this.tokenModel.findOne({ token }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findByUserId(userId: string): Promise<RefreshToken[]> {
    const docs = await this.tokenModel.find({ userId: new Types.ObjectId(userId) }).exec();
    return docs.map(doc => this.toDomain(doc));
  }

  async revokeToken(token: string): Promise<void> {
    await this.tokenModel.updateOne({ token }, { revokedAt: new Date() }).exec();
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.tokenModel
      .updateMany(
        { userId: new Types.ObjectId(userId), revokedAt: null },
        { revokedAt: new Date() },
      )
      .exec();
  }

  async deleteExpired(): Promise<number> {
    const result = await this.tokenModel.deleteMany({ expiresAt: { $lt: new Date() } }).exec();
    return result.deletedCount;
  }

  private toDomain(doc: RefreshTokenDocument): RefreshToken {
    return RefreshToken.create(
      doc._id.toString(),
      doc.userId.toString(),
      doc.token,
      doc.expiresAt,
      doc.createdAt,
      doc.revokedAt,
      doc.userAgent,
      doc.ipAddress,
    );
  }
}
