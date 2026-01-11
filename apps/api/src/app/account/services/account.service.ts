import { Injectable } from '@nestjs/common';
import { PrismaService } from '@ghostfolio/api/services/prisma/prisma.service';
import {
  Account,
  AccountBalance,
  Order,
  Platform,
  Prisma,
  SymbolProfile
} from '@prisma/client';

@Injectable()
export class AccountService {
  public constructor(private readonly prismaService: PrismaService) {}

  public async account({
    id_userId
  }: Prisma.AccountWhereUniqueInput): Promise<Account | null> {
    const [account] = await this.accounts({
      where: id_userId
    });

    return account;
  }

  public async accountWithActivities(
    accountWhereUniqueInput: Prisma.AccountWhereUniqueInput,
    accountInclude: Prisma.AccountInclude
  ): Promise<(Account & { activities?: Order[] }) | null> {
    return this.prismaService.account.findUnique({
      include: accountInclude,
      where: accountWhereUniqueInput
    });
  }

  public async accounts(params: {
    include?: Prisma.AccountInclude;
    skip?: number;
    take?: number;
    cursor?: Prisma.AccountWhereUniqueInput;
    where?: Prisma.AccountWhereInput;
    orderBy?: Prisma.AccountOrderByWithRelationInput;
  }): Promise<
    (Account & {
      activities?: (Order & { SymbolProfile?: SymbolProfile })[];
      balances?: AccountBalance[];
      platform?: Platform;
    })[]
  > {
    const { include = {}, skip, take, cursor, where, orderBy } = params;

    const isBalancesIncluded = !!include.balances;

    include.balances = {
      orderBy: { date: 'desc' },
      ...(isBalancesIncluded ? {} : { take: 1 })
    };

    const accounts = await this.prismaService.account.findMany({
      cursor,
      include,
      orderBy,
      skip,
      take,
      where
    });

    return accounts.map((account) => {
      account = { ...account, balance: account.balances[0]?.value ?? 0 };

      if (!isBalancesIncluded) {
        delete account.balances;
      }

      return account;
    });
  }

  public async getAccounts(userId: string): Promise<Account[]> {
    const accounts = await this.accounts({
      include: {
        activities: true,
        platform: true
      },
      orderBy: { name: 'asc' },
      where: { userId }
    });

    return accounts.map((account) => {
      let transactionCount = 0;

      for (const { isDraft } of account.activities) {
        if (!isDraft) {
          transactionCount += 1;
        }
      }

      const result = { ...account, transactionCount };

      delete result.activities;

      return result;
    });
  }
}