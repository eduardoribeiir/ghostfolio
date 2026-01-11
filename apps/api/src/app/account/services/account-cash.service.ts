import { Injectable } from '@nestjs/common';
import { ExchangeRateDataService } from '@ghostfolio/api/services/exchange-rate-data/exchange-rate-data.service';
import { AccountService } from './account.service';
import { Big } from 'big.js';
import { groupBy } from 'lodash';
import { Filter } from '@ghostfolio/common/interfaces';
import { CashDetails } from '../interfaces/cash-details.interface';

@Injectable()
export class AccountCashService {
  public constructor(
    private readonly accountService: AccountService,
    private readonly exchangeRateDataService: ExchangeRateDataService
  ) {}

  public async getCashDetails({
    currency,
    filters = [],
    userId,
    withExcludedAccounts = false
  }: {
    currency: string;
    filters?: Filter[];
    userId: string;
    withExcludedAccounts?: boolean;
  }): Promise<CashDetails> {
    let totalCashBalanceInBaseCurrency = new Big(0);

    const where: any = {
      userId
    };

    if (withExcludedAccounts === false) {
      where.isExcluded = false;
    }

    const { ACCOUNT: filtersByAccount } = groupBy(filters, ({ type }) => {
      return type;
    });

    if (filtersByAccount?.length > 0) {
      where.id = {
        in: filtersByAccount.map(({ id }) => {
          return id;
        })
      };
    }

    const accounts = await this.accountService.accounts({ where });

    for (const account of accounts) {
      totalCashBalanceInBaseCurrency = totalCashBalanceInBaseCurrency.plus(
        this.exchangeRateDataService.toCurrency(
          account.balance,
          account.currency,
          currency
        )
      );
    }

    return {
      accounts,
      balanceInBaseCurrency: totalCashBalanceInBaseCurrency.toNumber()
    };
  }
}