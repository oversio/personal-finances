import { Inject, Injectable } from "@nestjs/common";
import { Account } from "../../../domain/entities";
import { ACCOUNT_REPOSITORY, type AccountRepository } from "../../ports";
import { GetAccountsQuery } from "./get-accounts.query";

export type GetAccountsResult = ReturnType<Account["toPrimitives"]>[];

@Injectable()
export class GetAccountsHandler {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: AccountRepository,
  ) {}

  async execute(query: GetAccountsQuery): Promise<GetAccountsResult> {
    const accounts = await this.accountRepository.findByWorkspaceId(
      query.workspaceId,
      query.includeArchived,
    );

    return accounts.map(account => account.toPrimitives());
  }
}
