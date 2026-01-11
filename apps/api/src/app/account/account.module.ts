import { AccountBalanceModule } from '@ghostfolio/api/app/account/account-balance.module';
import { PortfolioModule } from '@ghostfolio/api/app/portfolio/portfolio.module';
import { RedactValuesInResponseModule } from '@ghostfolio/api/interceptors/redact-values-in-response/redact-values-in-response.module';
import { ApiModule } from '@ghostfolio/api/services/api/api.module';
import { ConfigurationModule } from '@ghostfolio/api/services/configuration/configuration.module';
import { ExchangeRateDataModule } from '@ghostfolio/api/services/exchange-rate-data/exchange-rate-data.module';
import { ImpersonationModule } from '@ghostfolio/api/services/impersonation/impersonation.module';
import { PrismaModule } from '@ghostfolio/api/services/prisma/prisma.module';

import { Module } from '@nestjs/common';

import { AccountController } from './controllers/account.controller';
import { AccountTransferController } from './controllers/account-transfer.controller';
import { AccountService } from './services/account.service';
import { AccountCrudService } from './services/account-crud.service';
import { AccountCashService } from './services/account-cash.service';

@Module({
  controllers: [
    AccountController,
    AccountTransferController
  ],
  exports: [AccountService, AccountCrudService, AccountCashService],
  imports: [
    AccountBalanceModule,
    ApiModule,
    ConfigurationModule,
    ExchangeRateDataModule,
    ImpersonationModule,
    PortfolioModule,
    PrismaModule,
    RedactValuesInResponseModule
  ],
  providers: [
    AccountService,
    AccountCrudService,
    AccountCashService
  ]
})
export class AccountModule {}