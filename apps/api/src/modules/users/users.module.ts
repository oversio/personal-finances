import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { USER_REPOSITORY } from "./application";
import { MongooseUserRepository, UserModel, UserSchema } from "./infrastructure";

const repositories = [
  {
    provide: USER_REPOSITORY,
    useClass: MongooseUserRepository,
  },
];

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema }]),
  ],
  providers: [...repositories],
  exports: [...repositories],
})
export class UsersModule {}
