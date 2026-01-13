import { Injectable } from '@angular/core';
import { UNKNOWN_KEY } from '@ghostfolio/common/config';
import { PortfolioPosition } from '@ghostfolio/common/interfaces';
import { AssetClass } from '@prisma/client';
import { isNumber } from 'lodash';
import { IGeographicData } from '../models/allocations-data.interface';

@Injectable()
export class GeographicDataProcessor {
  public processCountriesData(
    position: PortfolioPosition,
    continents: IGeographicData['continents'],
    countries: IGeographicData['countries']
  ): void {
    if (position.assetClass === AssetClass.LIQUIDITY) {
      return;
    }

    if (position.countries.length === 0) {
      this.addToUnknownLocation(position, continents, countries);
      return;
    }

    for (const country of position.countries) {
      this.addCountryData(country, position, continents, countries);
    }
  }

  private addCountryData(
    country: { code: string; continent: string; name: string; weight: number },
    position: PortfolioPosition,
    continents: IGeographicData['continents'],
    countries: IGeographicData['countries']
  ): void {
    const { code, continent, name, weight } = country;
    const value = this.calculateWeightedValue(weight, position);

    this.updateOrCreateContinent(continent, value, continents);
    this.updateOrCreateCountry(code, name, value, countries);
  }

  private calculateWeightedValue(weight: number, position: PortfolioPosition): number {
    const baseValue = isNumber(position.valueInBaseCurrency)
      ? position.valueInBaseCurrency
      : position.valueInPercentage;
    return weight * baseValue;
  }

  private updateOrCreateContinent(
    continent: string,
    value: number,
    continents: IGeographicData['continents']
  ): void {
    if (continents[continent]) {
      continents[continent].value += value;
    } else {
      continents[continent] = { name: continent, value };
    }
  }

  private updateOrCreateCountry(
    code: string,
    name: string,
    value: number,
    countries: IGeographicData['countries']
  ): void {
    if (countries[code]) {
      countries[code].value += value;
    } else {
      countries[code] = { name, value };
    }
  }

  private addToUnknownLocation(
    position: PortfolioPosition,
    continents: IGeographicData['continents'],
    countries: IGeographicData['countries']
  ): void {
    const value = isNumber(position.valueInBaseCurrency)
      ? position.valueInBaseCurrency
      : position.valueInPercentage;

    continents[UNKNOWN_KEY].value += value;
    countries[UNKNOWN_KEY].value += value;
  }
}
