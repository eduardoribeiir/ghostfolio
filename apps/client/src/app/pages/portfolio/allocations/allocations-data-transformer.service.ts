import { Injectable } from '@angular/core';
import { UNKNOWN_KEY } from '@ghostfolio/common/config';
import { PortfolioDetails, PortfolioPosition } from '@ghostfolio/common/interfaces';
import { MarketAdvanced } from '@ghostfolio/common/types';
import { translate } from '@ghostfolio/ui/i18n';
import { Account, AssetClass, AssetSubClass, Platform } from '@prisma/client';

@Injectable()
export class AllocationsDataTransformerService {
  public getValue(
    hasImpersonationId: boolean,
    percentageValue: number,
    currencyValue: number
  ): number {
    return hasImpersonationId ? percentageValue : currencyValue;
  }

  public transformAccounts(
    accounts: PortfolioDetails['accounts'],
    hasImpersonationId: boolean
  ): {
    [id: string]: Pick<Account, 'name'> & { id: string; value: number };
  } {
    const result: {
      [id: string]: Pick<Account, 'name'> & { id: string; value: number };
    } = {};

    for (const [id, { name, valueInBaseCurrency, valueInPercentage }] of Object.entries(accounts)) {
      result[id] = {
        id,
        name,
        value: this.getValue(hasImpersonationId, valueInPercentage, valueInBaseCurrency)
      };
    }

    return result;
  }

  public transformHoldings(
    holdings: PortfolioDetails['holdings'],
    hasImpersonationId: boolean
  ): {
    [symbol: string]: Pick<
      PortfolioPosition,
      | 'assetClass'
      | 'assetClassLabel'
      | 'assetSubClass'
      | 'assetSubClassLabel'
      | 'currency'
      | 'exchange'
      | 'name'
    > & { etfProvider: string; value: number };
  } {
    const result: any = {};

    for (const [symbol, position] of Object.entries(holdings)) {
      result[symbol] = {
        value: this.getValue(
          hasImpersonationId,
          position.allocationInPercentage,
          position.valueInBaseCurrency
        ),
        assetClass: position.assetClass || (UNKNOWN_KEY as AssetClass),
        assetClassLabel: position.assetClassLabel || UNKNOWN_KEY,
        assetSubClass: position.assetSubClass || (UNKNOWN_KEY as AssetSubClass),
        assetSubClassLabel: position.assetSubClassLabel || UNKNOWN_KEY,
        currency: position.currency,
        etfProvider: this.extractEtfProvider(position.assetSubClass, position.name),
        exchange: position.exchange,
        name: position.name
      };
    }

    return result;
  }

  public transformHolding(
    position: PortfolioPosition,
    hasImpersonationId: boolean
  ): Pick<
    PortfolioPosition,
    | 'assetClass'
    | 'assetClassLabel'
    | 'assetSubClass'
    | 'assetSubClassLabel'
    | 'currency'
    | 'exchange'
    | 'name'
  > & { etfProvider: string; value: number } {
    return {
      value: this.getValue(
        hasImpersonationId,
        position.allocationInPercentage,
        position.valueInBaseCurrency
      ),
      assetClass: position.assetClass || (UNKNOWN_KEY as AssetClass),
      assetClassLabel: position.assetClassLabel || UNKNOWN_KEY,
      assetSubClass: position.assetSubClass || (UNKNOWN_KEY as AssetSubClass),
      assetSubClassLabel: position.assetSubClassLabel || UNKNOWN_KEY,
      currency: position.currency,
      etfProvider: this.extractEtfProvider(position.assetSubClass, position.name),
      exchange: position.exchange,
      name: position.name
    };
  }

  public transformPlatforms(
    platforms: PortfolioDetails['platforms'],
    hasImpersonationId: boolean
  ): {
    [id: string]: Pick<Platform, 'name'> & { id: string; value: number };
  } {
    const result: {
      [id: string]: Pick<Platform, 'name'> & { id: string; value: number };
    } = {};

    for (const [id, { name, valueInBaseCurrency, valueInPercentage }] of Object.entries(platforms)) {
      result[id] = {
        id,
        name,
        value: this.getValue(hasImpersonationId, valueInPercentage, valueInBaseCurrency)
      };
    }

    return result;
  }

  public createInitialMarketsAdvanced(): {
    [key in MarketAdvanced]: {
      id: MarketAdvanced;
      name: string;
      value: number;
    };
  } {
    return {
      [UNKNOWN_KEY]: { id: UNKNOWN_KEY, name: UNKNOWN_KEY, value: 0 },
      asiaPacific: { id: 'asiaPacific', name: translate('Asia-Pacific'), value: 0 },
      emergingMarkets: { id: 'emergingMarkets', name: translate('Emerging Markets'), value: 0 },
      europe: { id: 'europe', name: translate('Europe'), value: 0 },
      japan: { id: 'japan', name: translate('Japan'), value: 0 },
      northAmerica: { id: 'northAmerica', name: translate('North America'), value: 0 },
      otherMarkets: { id: 'otherMarkets', name: translate('Other Markets'), value: 0 }
    };
  }

  public createInitialContinents(): {
    [code: string]: { name: string; value: number };
  } {
    return {
      [UNKNOWN_KEY]: { name: UNKNOWN_KEY, value: 0 }
    };
  }

  public createInitialCountries(): {
    [code: string]: { name: string; value: number };
  } {
    return {
      [UNKNOWN_KEY]: { name: UNKNOWN_KEY, value: 0 }
    };
  }

  public createInitialSectors(): {
    [name: string]: { name: string; value: number };
  } {
    return {
      [UNKNOWN_KEY]: { name: UNKNOWN_KEY, value: 0 }
    };
  }

  public createInitialSymbols(): {
    [name: string]: { name: string; symbol: string; value: number };
  } {
    return {
      [UNKNOWN_KEY]: { name: UNKNOWN_KEY, symbol: UNKNOWN_KEY, value: 0 }
    };
  }

  private extractEtfProvider(assetSubClass: string, name: string): string {
    if (assetSubClass === 'ETF') {
      const [firstWord] = name.split(' ');
      return firstWord;
    }
    return UNKNOWN_KEY;
  }

  public processCountries(
    position: PortfolioPosition,
    continents: any,
    countries: any,
    isNumber: (value: any) => boolean
  ): { continents: any; countries: any } {
    if (position.countries.length > 0) {
      for (const country of position.countries) {
        const { code, continent, name, weight } = country;
        const value = isNumber(position.valueInBaseCurrency)
          ? position.valueInBaseCurrency
          : position.valueInPercentage;

        if (continents[continent]?.value) {
          continents[continent].value += weight * value;
        } else {
          continents[continent] = {
            name: continent,
            value: weight * value
          };
        }

        if (countries[code]?.value) {
          countries[code].value += weight * value;
        } else {
          countries[code] = {
            name,
            value: weight * value
          };
        }
      }
    } else {
      const value = isNumber(position.valueInBaseCurrency)
        ? position.valueInBaseCurrency
        : position.valueInPercentage;

      continents[UNKNOWN_KEY].value += value;
      countries[UNKNOWN_KEY].value += value;
    }

    return { continents, countries };
  }

  public processHoldings(
    position: PortfolioPosition,
    topHoldingsMap: any,
    isNumber: (value: any) => boolean
  ): any {
    if (position.holdings.length > 0) {
      for (const holding of position.holdings) {
        const { allocationInPercentage, name, valueInBaseCurrency } = holding;

        const value = isNumber(valueInBaseCurrency)
          ? valueInBaseCurrency
          : allocationInPercentage * position.valueInPercentage;

        if (topHoldingsMap[name]?.value) {
          topHoldingsMap[name].value += value;
        } else {
          topHoldingsMap[name] = {
            name,
            value
          };
        }
      }
    }

    return topHoldingsMap;
  }

  public processSectors(
    position: PortfolioPosition,
    sectors: any,
    isNumber: (value: any) => boolean
  ): any {
    if (position.sectors.length > 0) {
      for (const sector of position.sectors) {
        const { name, weight } = sector;
        const value = isNumber(position.valueInBaseCurrency)
          ? position.valueInBaseCurrency
          : position.valueInPercentage;

        if (sectors[name]?.value) {
          sectors[name].value += weight * value;
        } else {
          sectors[name] = {
            name,
            value: weight * value
          };
        }
      }
    } else {
      const value = isNumber(position.valueInBaseCurrency)
        ? position.valueInBaseCurrency
        : position.valueInPercentage;

      sectors[UNKNOWN_KEY].value += value;
    }

    return sectors;
  }

  public processAllHoldings(
    portfolioHoldings: PortfolioDetails['holdings'],
    hasImpersonationId: boolean,
    continents: any,
    countries: any,
    topHoldingsMap: any,
    sectors: any,
    symbols: any,
    isNumber: (value: any) => boolean,
    prettifySymbol: (symbol: string) => string,
    AssetClass: any
  ): {
    continents: any;
    countries: any;
    topHoldingsMap: any;
    sectors: any;
    symbols: any;
    totalValueInEtf: number;
  } {
    let totalValueInEtf = 0;

    for (const [symbol, position] of Object.entries(portfolioHoldings)) {
      const holding = this.transformHolding(position, hasImpersonationId);

      if (position.assetClass !== AssetClass.LIQUIDITY) {
        const countriesResult = this.processCountries(
          position,
          continents,
          countries,
          isNumber
        );
        continents = countriesResult.continents;
        countries = countriesResult.countries;

        topHoldingsMap = this.processHoldings(
          position,
          topHoldingsMap,
          isNumber
        );

        sectors = this.processSectors(position, sectors, isNumber);
      }

      if (holding.assetSubClass === 'ETF') {
        totalValueInEtf += holding.value;
      }

      symbols[prettifySymbol(symbol)] = {
        dataSource: position.dataSource,
        name: position.name,
        symbol: prettifySymbol(symbol),
        value: isNumber(position.valueInBaseCurrency)
          ? position.valueInBaseCurrency
          : position.valueInPercentage
      };
    }

    return {
      continents,
      countries,
      topHoldingsMap,
      sectors,
      symbols,
      totalValueInEtf
    };
  }
}
