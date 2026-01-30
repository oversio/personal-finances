import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UserRepository } from "../../../application/ports";
import { User } from "../../../domain/entities";
import type { AuthProviderType } from "../../../domain/value-objects";
import { UserDocument, UserModel } from "../schemas";

@Injectable()
export class MongooseUserRepository implements UserRepository {
  constructor(
    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async save(user: User): Promise<User> {
    const doc = new this.userModel({
      email: user.email.value,
      name: user.name.value,
      passwordHash: user.passwordHash?.value,
      provider: user.provider.value,
      providerId: user.providerId,
      isEmailVerified: user.isEmailVerified,
      picture: user.picture,
    });

    const saved = await doc.save();
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<User | null> {
    const doc = await this.userModel.findById(id).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await this.userModel.findOne({ email: email.toLowerCase() }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findByProviderId(provider: string, providerId: string): Promise<User | null> {
    const doc = await this.userModel.findOne({ provider, providerId }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async update(user: User): Promise<User> {
    const doc = await this.userModel
      .findByIdAndUpdate(
        user.id!.value,
        {
          email: user.email.value,
          name: user.name.value,
          passwordHash: user.passwordHash?.value,
          isEmailVerified: user.isEmailVerified,
          picture: user.picture,
        },
        { new: true },
      )
      .exec();

    if (!doc) {
      throw new Error(`User with id ${user.id!.value} not found`);
    }

    return this.toDomain(doc);
  }

  async delete(id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(id).exec();
  }

  private toDomain(doc: UserDocument): User {
    return User.create(
      doc._id.toString(),
      doc.email,
      doc.name,
      doc.passwordHash,
      doc.provider as AuthProviderType,
      doc.providerId,
      doc.isEmailVerified,
      doc.picture,
      doc.createdAt,
      doc.updatedAt,
    );
  }
}
