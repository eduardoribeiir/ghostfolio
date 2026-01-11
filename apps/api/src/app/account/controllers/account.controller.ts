import {
  Controller,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
  Headers,
  Query,
  Post,
  Put,
  Delete,
  Body
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { REQUEST } from '@nestjs/core';
import { Inject } from '@nestjs/core';
import { HasPermission } from '@ghostfolio/api/decorators/has-permission.decorator';
import { HasPermissionGuard } from '@ghostfolio/api/guards/has-permission.guard';
import { RedactValuesInResponseInterceptor } from '@ghostfolio/api/interceptors/redact-values-in-response/redact-values-in-response.interceptor';
import { TransformDataSourceInRequestInterceptor } from '@ghostfolio/api/interceptors/transform-data-source-in-request/transform-data-source-in-request.interceptor';
import { ApiService } from '@ghostfolio/api/services/api/api.service';
import { ImpersonationService } from '@ghostfolio/api/services/impersonation/impersonation.service';
import { HEADER_KEY_IMPERSONATION } from '@ghostfolio/common/config';
import {
  CreateAccountDto,
  UpdateAccountDto
} from '@ghostfolio/common/dtos';
import {
  AccountResponse,
  AccountsResponse
} from '@ghostfolio/common/interfaces';
import { permissions } from '@ghostfolio/common/permissions';
import type { RequestWithUser } from '@ghostfolio/common/types';
import { PortfolioService } from '@ghostfolio/api/app/portfolio/portfolio.service';
import { AccountHelper } from '../utils/account.helper';
import { AccountService } from '../services/account.service';
import { AccountCrudService } from '../services/account-crud.service';
import { Account, Prisma } from '@prisma/client';

@Controller('account')
export class AccountController {
  public constructor(
    private readonly accountCrudService: AccountCrudService,
    private readonly accountService: AccountService,
    private readonly apiService: ApiService,
    private readonly impersonationService: ImpersonationService,
    private readonly portfolioService: PortfolioService,
    @Inject(REQUEST) private readonly request: RequestWithUser
  ) {}

  @Delete(':id')
  @HasPermission(permissions.deleteAccount)
  @UseGuards(AuthGuard('jwt'), HasPermissionGuard)
  public async deleteAccount(@Param('id') id: string): Promise<Account> {
    const account = await this.accountService.accountWithActivities(
      AccountHelper.buildAccountWhereUniqueInput(id, this.request.user.id),
      { activities: true }
    );

    AccountHelper.validateAccountHasNoActivities(account);
    AccountHelper.validateAccountOwnership(account, this.request.user.id);

    return this.accountCrudService.deleteAccount(
      AccountHelper.buildAccountWhereUniqueInput(id, this.request.user.id)
    );
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), HasPermissionGuard)
  @UseInterceptors(RedactValuesInResponseInterceptor)
  @UseInterceptors(TransformDataSourceInRequestInterceptor)
  public async getAllAccounts(
    @Headers(HEADER_KEY_IMPERSONATION.toLowerCase()) impersonationId: string,
    @Query('dataSource') filterByDataSource?: string,
    @Query('query') filterBySearchQuery?: string,
    @Query('symbol') filterBySymbol?: string
  ): Promise<AccountsResponse> {
    const impersonationUserId =
      await this.impersonationService.validateImpersonationId(impersonationId);

    const filters = this.apiService.buildFiltersFromQueryParams({
      filterByDataSource,
      filterBySearchQuery,
      filterBySymbol
    });

    return this.portfolioService.getAccountsWithAggregations({
      filters,
      userId: impersonationUserId || this.request.user.id,
      withExcludedAccounts: true
    });
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), HasPermissionGuard)
  @UseInterceptors(RedactValuesInResponseInterceptor)
  public async getAccountById(
    @Headers(HEADER_KEY_IMPERSONATION.toLowerCase()) impersonationId: string,
    @Param('id') id: string
  ): Promise<AccountResponse> {
    const impersonationUserId =
      await this.impersonationService.validateImpersonationId(impersonationId);

    const accountsWithAggregations =
      await this.portfolioService.getAccountsWithAggregations({
        filters: [{ id, type: 'ACCOUNT' }],
        userId: impersonationUserId || this.request.user.id,
        withExcludedAccounts: true
      });

    return accountsWithAggregations.accounts[0];
  }

  @HasPermission(permissions.createAccount)
  @Post()
  @UseGuards(AuthGuard('jwt'), HasPermissionGuard)
  public async createAccount(@Body() data: CreateAccountDto): Promise<Account> {
    const accountData = this.prepareAccountData(data);

    return this.accountCrudService.createAccount(
      accountData,
      this.request.user.id
    );
  }

  @HasPermission(permissions.updateAccount)
  @Put(':id')
  @UseGuards(AuthGuard('jwt'), HasPermissionGuard)
  public async update(
    @Param('id') id: string,
    @Body() data: UpdateAccountDto
  ): Promise<Account> {
    const originalAccount = await this.accountService.account(
      AccountHelper.buildAccountWhereUniqueInput(id, this.request.user.id)
    );

    AccountHelper.validateAccountOwnership(originalAccount, this.request.user.id);

    const accountData = this.prepareUpdateAccountData(data, originalAccount);

    return this.accountCrudService.updateAccount(
      {
        data: accountData,
        where: AccountHelper.buildAccountWhereUniqueInput(id, this.request.user.id)
      },
      this.request.user.id
    );
  }

  private prepareAccountData(data: CreateAccountDto): Prisma.AccountCreateInput {
    const { platformId, ...baseData } = data;
    
    const accountData: Prisma.AccountCreateInput = {
      ...baseData,
      user: { connect: { id: this.request.user.id } }
    };

    if (platformId) {
      accountData.platform = { connect: { id: platformId } };
    }

    return accountData;
  }

  private prepareUpdateAccountData(
    data: UpdateAccountDto,
    originalAccount: Account
  ): Prisma.AccountUpdateInput {
    const { platformId, ...baseData } = data;
    
    const accountData: Prisma.AccountUpdateInput = {
      ...baseData,
      user: { connect: { id: this.request.user.id } }
    };

    if (platformId) {
      accountData.platform = { connect: { id: platformId } };
    } else if (originalAccount.platformId) {
      accountData.platform = { disconnect: true };
    }

    return accountData;
  }
}