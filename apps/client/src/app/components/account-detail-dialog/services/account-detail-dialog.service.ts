import { Injectable } from '@angular/core';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { DataService } from '@ghostfolio/ui/services';
import { MatTableDataSource } from '@angular/material/table';
import { Activity, HistoricalDataItem, PortfolioPosition, AccountBalancesResponse } from '@ghostfolio/common/interfaces';
import { CreateAccountBalanceDto } from '@ghostfolio/common/dtos';
import { SortDirection } from '@angular/material/sort';
import { NUMERICAL_PRECISION_THRESHOLD_6_FIGURES } from '@ghostfolio/common/config';
import { DATE_FORMAT, downloadAsFile } from '@ghostfolio/common/helper';
import { format, parseISO } from 'date-fns';
import { Big } from 'big.js';
import { isNumber } from 'lodash';

@Injectable()
export class AccountDetailDialogService {
  public constructor(private dataService: DataService) {}

  public fetchAccount(
    accountId: string,
    deviceType: string,
    onData: (data: {
      balance: number;
      balancePrecision: number;
      currency: string;
      dividendInBaseCurrency: number;
      dividendInBaseCurrencyPrecision: number;
      equity: number;
      equityPrecision: number;
      interestInBaseCurrency: number;
      interestInBaseCurrencyPrecision: number;
      name: string;
      platformName: string;
      transactionCount: number;
      valueInBaseCurrency: number;
    }) => void,
    unsubscribe: Subject<void>
  ): void {
    this.dataService
      .fetchAccount(accountId)
      .pipe(takeUntil(unsubscribe))
      .subscribe(
        ({
          balance,
          currency,
          dividendInBaseCurrency,
          interestInBaseCurrency,
          name,
          platform,
          transactionCount,
          value,
          valueInBaseCurrency
        }) => {
          const balancePrecision =
            balance >= NUMERICAL_PRECISION_THRESHOLD_6_FIGURES &&
            deviceType === 'mobile'
              ? 0
              : 2;

          const dividendPrecision =
            deviceType === 'mobile' &&
            dividendInBaseCurrency >= NUMERICAL_PRECISION_THRESHOLD_6_FIGURES
              ? 0
              : 2;

          const interestPrecision =
            deviceType === 'mobile' &&
            interestInBaseCurrency >= NUMERICAL_PRECISION_THRESHOLD_6_FIGURES
              ? 0
              : 2;

          let equity: number = null;
          let equityPrecision = 2;

          if (isNumber(balance) && isNumber(value)) {
            equity = new Big(value).minus(balance).toNumber();
            if (
              deviceType === 'mobile' &&
              equity >= NUMERICAL_PRECISION_THRESHOLD_6_FIGURES
            ) {
              equityPrecision = 0;
            }
          }

          onData({
            balance,
            balancePrecision,
            currency,
            dividendInBaseCurrency,
            dividendInBaseCurrencyPrecision: dividendPrecision,
            equity,
            equityPrecision,
            interestInBaseCurrency,
            interestInBaseCurrencyPrecision: interestPrecision,
            name,
            platformName: platform?.name ?? '-',
            transactionCount,
            valueInBaseCurrency
          });
        }
      );
  }

  public fetchActivities(
    accountId: string,
    sortColumn: string,
    sortDirection: SortDirection,
    onData: (dataSource: MatTableDataSource<Activity>, count: number) => void,
    unsubscribe: Subject<void>
  ): void {
    this.dataService
      .fetchActivities({
        filters: [{ id: accountId, type: 'ACCOUNT' }],
        sortColumn,
        sortDirection
      })
      .pipe(takeUntil(unsubscribe))
      .subscribe(({ activities, count }) => {
        onData(new MatTableDataSource(activities), count);
      });
  }

  public fetchChart(
    accountId: string,
    onData: (data: {
      accountBalances: AccountBalancesResponse['balances'];
      historicalDataItems: HistoricalDataItem[];
    }) => void,
    onError: () => void,
    unsubscribe: Subject<void>
  ): void {
    forkJoin({
      accountBalances: this.dataService
        .fetchAccountBalances(accountId)
        .pipe(takeUntil(unsubscribe)),
      portfolioPerformance: this.dataService
        .fetchPortfolioPerformance({
          filters: [{ id: accountId, type: 'ACCOUNT' }],
          range: 'max',
          withExcludedAccounts: true,
          withItems: true
        })
        .pipe(takeUntil(unsubscribe))
    }).subscribe({
      error: onError,
      next: ({ accountBalances, portfolioPerformance }) => {
        let historicalDataItems: HistoricalDataItem[];

        if (portfolioPerformance.chart.length > 0) {
          historicalDataItems = portfolioPerformance.chart.map(
            ({ date, netWorth, netWorthInPercentage }) => ({
              date,
              value: isNumber(netWorth) ? netWorth : netWorthInPercentage
            })
          );
        } else {
          historicalDataItems = accountBalances.balances.map(
            ({ date, valueInBaseCurrency }) => ({
              date: format(date, DATE_FORMAT),
              value: valueInBaseCurrency
            })
          );
        }

        onData({
          accountBalances: accountBalances.balances,
          historicalDataItems
        });
      }
    });
  }

  public fetchHoldings(
    accountId: string,
    onData: (holdings: PortfolioPosition[]) => void,
    unsubscribe: Subject<void>
  ): void {
    this.dataService
      .fetchPortfolioHoldings({
        filters: [{ type: 'ACCOUNT', id: accountId }]
      })
      .pipe(takeUntil(unsubscribe))
      .subscribe(({ holdings }) => {
        onData(holdings);
      });
  }

  public handleAddAccountBalance(
    accountBalance: CreateAccountBalanceDto,
    onSuccess: () => void,
    unsubscribe: Subject<void>
  ): void {
    this.dataService
      .postAccountBalance(accountBalance)
      .pipe(takeUntil(unsubscribe))
      .subscribe(() => onSuccess());
  }

  public handleDeleteAccountBalance(
    id: string,
    onSuccess: () => void,
    unsubscribe: Subject<void>
  ): void {
    this.dataService
      .deleteAccountBalance(id)
      .pipe(takeUntil(unsubscribe))
      .subscribe(() => onSuccess());
  }

  public initializeAll(
    accountId: string,
    deviceType: string,
    sortColumn: string,
    sortDirection: SortDirection,
    callbacks: {
      onAccount: (data: any) => void;
      onActivities: (dataSource: MatTableDataSource<Activity>, count: number) => void;
      onChart: (data: { accountBalances: AccountBalancesResponse['balances']; historicalDataItems: HistoricalDataItem[] }) => void;
      onChartError: () => void;
      onHoldings: (holdings: PortfolioPosition[]) => void;
    },
    unsubscribe: Subject<void>
  ): void {
    this.fetchAccount(accountId, deviceType, callbacks.onAccount, unsubscribe);
    this.fetchActivities(accountId, sortColumn, sortDirection, callbacks.onActivities, unsubscribe);
    this.fetchChart(accountId, callbacks.onChart, callbacks.onChartError, unsubscribe);
    this.fetchHoldings(accountId, callbacks.onHoldings, unsubscribe);
  }

  public handleExport(
    activities: Activity[],
    accountName: string,
    unsubscribe: Subject<void>
  ): void {
    const activityIds = activities.map(({ id }) => id);

    this.dataService
      .fetchExport({ activityIds })
      .pipe(takeUntil(unsubscribe))
      .subscribe((data) => {
        downloadAsFile({
          content: data,
          fileName: `ghostfolio-export-${accountName
            .replace(/\s+/g, '-')
            .toLowerCase()}-${format(
            parseISO(data.meta.date),
            'yyyyMMddHHmm'
          )}.json`,
          format: 'json'
        });
      });
  }
}
