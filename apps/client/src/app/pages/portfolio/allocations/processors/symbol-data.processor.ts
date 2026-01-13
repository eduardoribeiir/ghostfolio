import { Injectable } from '@angular/core';
import { UNKNOWN_KEY } from '@ghostfolio/common/config';
import { PortfolioPosition } from '@ghostfolio/common/interfaces';
import { prettifySymbol } from '@ghostfolio/common/helper';
import { isNumber } from 'lodash';
import { IAllocationsData } from '../models/allocations-data.interface';

@Injectable()
export class SymbolDataProcessor {
  public processSymbolData(
    position: PortfolioPosition,
    symbol: string,
    symbols: IAllocationsData['symbols']
  ): void {
    const prettifiedSymbol = prettifySymbol(symbol);
    const value = this.getSymbolValue(position);

    symbols[prettifiedSymbol] = {
      dataSource: position.dataSource,
      name: position.name,
      symbol: prettifiedSymbol,
      value
    };
  }

  public calculateEtfValue(
    holding: IAllocationsData['holdings'][string],
    currentEtfValue: number
  ): number {
    if (holding.assetSubClass === 'ETF') {
      return currentEtfValue + holding.value;
    }
    return currentEtfValue;
  }

  private getSymbolValue(position: PortfolioPosition): number {
    return isNumber(position.valueInBaseCurrency)
      ? position.valueInBaseCurrency
      : position.valueInPercentage;
  }
}
