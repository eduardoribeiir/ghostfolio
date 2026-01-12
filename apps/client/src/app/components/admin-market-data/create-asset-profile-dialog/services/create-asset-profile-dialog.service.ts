import { Injectable } from '@angular/core';
import { Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { AdminService, DataService } from '@ghostfolio/ui/services';
import { DataSource } from '@prisma/client';
import {
  DEFAULT_CURRENCY,
  PROPERTY_CURRENCIES
} from '@ghostfolio/common/config';
import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';
import { isISO4217CurrencyCode } from 'class-validator';

@Injectable()
export class CreateAssetProfileDialogService {
  public constructor(
    private readonly adminService: AdminService,
    private readonly dataService: DataService
  ) {}

  public initialize(
    onData: (customCurrencies: string[], dataSource: DataSource) => void,
    unsubscribe: Subject<void>
  ): void {
    this.adminService
      .fetchAdminData()
      .pipe(takeUntil(unsubscribe))
      .subscribe(({ dataProviders, settings }) => {
        const customCurrencies = settings[PROPERTY_CURRENCIES] as string[];

        const { dataSource } = dataProviders.find(({ useForExchangeRates }) => {
          return useForExchangeRates;
        });

        onData(customCurrencies, dataSource);
      });
  }

  public handleAddCurrency(
    currency: string,
    customCurrencies: string[],
    dataSourceForExchangeRates: DataSource,
    onSuccess: () => void,
    unsubscribe: Subject<void>
  ): void {
    const currencies = Array.from(
      new Set([...customCurrencies, currency])
    ).sort();

    this.dataService
      .putAdminSetting(PROPERTY_CURRENCIES, {
        value: JSON.stringify(currencies)
      })
      .pipe(
        switchMap(() => {
          return this.adminService.gatherSymbol({
            dataSource: dataSourceForExchangeRates,
            symbol: `${DEFAULT_CURRENCY}${currency}`
          });
        }),
        takeUntil(unsubscribe)
      )
      .subscribe(() => {
        onSuccess();
      });
  }

  public iso4217CurrencyCodeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (
        control.value !== control.value?.toUpperCase() ||
        !isISO4217CurrencyCode(control.value)
      ) {
        return { invalidCurrency: true };
      }

      return null;
    };
  }

  public atLeastOneValid(control: AbstractControl): ValidationErrors {
    const addCurrencyControl = control.get('addCurrency');
    const addSymbolControl = control.get('addSymbol');
    const searchSymbolControl = control.get('searchSymbol');

    if (
      addCurrencyControl.valid &&
      addSymbolControl.valid &&
      searchSymbolControl.valid
    ) {
      return { atLeastOneValid: true };
    }

    if (
      addCurrencyControl.valid ||
      !addCurrencyControl ||
      addSymbolControl.valid ||
      !addSymbolControl ||
      searchSymbolControl.valid ||
      !searchSymbolControl
    ) {
      return { atLeastOneValid: false };
    }

    return { atLeastOneValid: true };
  }
}
