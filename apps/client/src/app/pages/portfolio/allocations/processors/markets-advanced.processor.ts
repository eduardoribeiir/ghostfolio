import { Injectable } from '@angular/core';
import { IAllocationsData } from '../models/allocations-data.interface';
import { PortfolioDetails } from '@ghostfolio/common/interfaces';
import { isNumber } from 'lodash';

@Injectable()
export class MarketsAdvancedProcessor {
  public processMarketsAdvanced(
    marketsAdvanced: IAllocationsData['marketsAdvanced'],
    portfolioMarketsAdvanced: PortfolioDetails['marketsAdvanced']
  ): IAllocationsData['marketsAdvanced'] {
    Object.values(portfolioMarketsAdvanced).forEach(
      ({ id, valueInBaseCurrency, valueInPercentage }) => {
        marketsAdvanced[id].value = this.getValue(valueInBaseCurrency, valueInPercentage);
      }
    );

    return marketsAdvanced;
  }

  private getValue(valueInBaseCurrency: number, valueInPercentage: number): number {
    return isNumber(valueInBaseCurrency) ? valueInBaseCurrency : valueInPercentage;
  }
}
