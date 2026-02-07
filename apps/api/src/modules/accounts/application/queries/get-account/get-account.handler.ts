import { Inject, Injectable } from "@nestjs/common";
import { Account } from "../../../domain/entities";
import { AccountNotFoundError } from "../../../domain/exceptions";
import { ACCOUNT_REPOSITORY, type AccountRepository } from "../../ports";
import { GetAccountQuery } from "./get-account.query";

export type GetAccountResult = ReturnType<Account["toPrimitives"]>;

@Injectable()
export class GetAccountHandler {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: AccountRepository,
  ) {}

  async execute(query: GetAccountQuery): Promise<GetAccountResult> {
    const account = await this.accountRepository.findById(query.id);

    if (!account || account.workspaceId.value !== query.workspaceId) {
      throw new AccountNotFoundError(query.id);
    }

    return account.toPrimitives();
  }
}
