import { Injectable } from '@nestjs/common';
import { Account, Prisma } from '@prisma/client';
import { PrismaService } from '@ghostfolio/api/services/prisma/prisma.service';
import { AccountBalanceService } from '@ghostfolio/api/app/account/services/account-balance.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PortfolioChangedEvent } from '@ghostfolio/api/events/portfolio-changed.event';
import { format } from 'date-fns';
import { DATE_FORMAT } from '@ghostfolio/common/helper';

@Injectable()
export class AccountCrudService {
  public constructor(
    private readonly accountBalanceService: AccountBalanceService,
    private readonly eventEmitter: EventEmitter2,
    private readonly prismaService: PrismaService
  ) {}

  public async createAccount(
    data: Prisma.AccountCreateInput,
    userId: string
  ): Promise<Account> {
    const account = await this.prismaService.account.create({
      data
    });

    await this.accountBalanceService.createOrUpdateAccountBalance({
      accountId: account.id,
      balance: data.balance,
      date: format(new Date(), DATE_FORMAT),
      userId
    });

    this.emitPortfolioChangedEvent(account.userId);

    return account;
  }

  public async deleteAccount(
    where: Prisma.AccountWhereUniqueInput
  ): Promise<Account> {
    const account = await this.prismaService.account.delete({
      where
    });

    this.emitPortfolioChangedEvent(account.userId);

    return account;
  }

  public async updateAccount(
    params: {
      where: Prisma.AccountWhereUniqueInput;
      data: Prisma.AccountUpdateInput;
    },
    userId: string
  ): Promise<Account> {
    const { data, where } = params;

    await this.accountBalanceService.createOrUpdateAccountBalance({
      accountId: data.id as string,
      balance: data.balance as number,
      date: format(new Date(), DATE_FORMAT),
      userId
    });

    const account = await this.prismaService.account.update({
      data,
      where
    });

    this.emitPortfolioChangedEvent(account.userId);

    return account;
  }

  private emitPortfolioChangedEvent(userId: string): void {
    this.eventEmitter.emit(
      PortfolioChangedEvent.getName(),
      new PortfolioChangedEvent({ userId })
    );
  }
}