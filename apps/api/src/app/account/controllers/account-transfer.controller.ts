import {
  Controller,
  Post,
  Body,
  UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { REQUEST } from '@nestjs/core';
import { Inject } from '@nestjs/core';
import { HasPermission } from '@ghostfolio/api/decorators/has-permission.decorator';
import { HasPermissionGuard } from '@ghostfolio/api/guards/has-permission.guard';
import { TransferBalanceDto } from '@ghostfolio/common/dtos';
import { permissions } from '@ghostfolio/common/permissions';
import type { RequestWithUser } from '@ghostfolio/common/types';
import { AccountService } from '../services/account.service';
import { AccountBalanceService } from '@ghostfolio/api/app/account/services/account-balance.service';
import { AccountHelper } from '../utils/account.helper';
import { Account } from '@prisma/client';

@Controller('account')
export class AccountTransferController {
  public constructor(
    private readonly accountBalanceService: AccountBalanceService,
    private readonly accountService: AccountService,
    @Inject(REQUEST) private readonly request: RequestWithUser
  ) {}

  @HasPermission(permissions.updateAccount)
  @Post('transfer-balance')
  @UseGuards(AuthGuard('jwt'), HasPermissionGuard)
  public async transferAccountBalance(
    @Body() { accountIdFrom, accountIdTo, balance }: TransferBalanceDto
  ): Promise<void> {
    const accountsOfUser = await this.accountService.getAccounts(
      this.request.user.id
    );

    const accountFrom = accountsOfUser.find(({ id }) => id === accountIdFrom);
    const accountTo = accountsOfUser.find(({ id }) => id === accountIdTo);

    AccountHelper.validateAccountsExist(accountFrom, accountTo);
    AccountHelper.validateTransferAccountsAreDifferent(accountIdFrom, accountIdTo);
    
    if (accountFrom) {
      AccountHelper.validateSufficientBalance(accountFrom, balance);
    }

    await this.accountBalanceService.updateAccountBalance({
      accountId: accountFrom!.id,
      amount: -balance,
      currency: accountFrom!.currency,
      userId: this.request.user.id
    });

    await this.accountBalanceService.updateAccountBalance({
      accountId: accountTo!.id,
      amount: balance,
      currency: accountFrom!.currency,
      userId: this.request.user.id
    });
  }
}