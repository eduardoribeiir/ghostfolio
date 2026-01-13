import { Injectable } from '@angular/core';
import { UNKNOWN_KEY } from '@ghostfolio/common/config';
import { PortfolioPosition } from '@ghostfolio/common/interfaces';
import { AssetClass } from '@prisma/client';
import { isNumber } from 'lodash';
import { ISectorData } from '../models/allocations-data.interface';

@Injectable()
export class SectorDataProcessor {
  public processSectorsData(
    position: PortfolioPosition,
    sectors: ISectorData['sectors'],
    topHoldingsMap: ISectorData['topHoldingsMap']
  ): void {
    if (position.assetClass === AssetClass.LIQUIDITY) {
      return;
    }

    this.processSectors(position, sectors);
    this.processHoldings(position, topHoldingsMap);
  }

  private processSectors(
    position: PortfolioPosition,
    sectors: ISectorData['sectors']
  ): void {
    if (position.sectors.length === 0) {
      this.addToUnknownSector(position, sectors);
      return;
    }

    for (const sector of position.sectors) {
      this.addSectorData(sector, position, sectors);
    }
  }

  private processHoldings(
    position: PortfolioPosition,
    topHoldingsMap: ISectorData['topHoldingsMap']
  ): void {
    if (position.holdings.length === 0) {
      return;
    }

    for (const holding of position.holdings) {
      this.addHoldingData(holding, position, topHoldingsMap);
    }
  }

  private addSectorData(
    sector: { name: string; weight: number },
    position: PortfolioPosition,
    sectors: ISectorData['sectors']
  ): void {
    const { name, weight } = sector;
    const value = this.calculateWeightedValue(weight, position);

    if (sectors[name]) {
      sectors[name].value += value;
    } else {
      sectors[name] = { name, value };
    }
  }

  private addHoldingData(
    holding: { name: string; allocationInPercentage: number; valueInBaseCurrency: number },
    position: PortfolioPosition,
    topHoldingsMap: ISectorData['topHoldingsMap']
  ): void {
    const { name, allocationInPercentage, valueInBaseCurrency } = holding;
    const value = this.calculateHoldingValue(
      valueInBaseCurrency,
      allocationInPercentage,
      position.valueInPercentage
    );

    if (topHoldingsMap[name]) {
      topHoldingsMap[name].value += value;
    } else {
      topHoldingsMap[name] = { name, value };
    }
  }

  private calculateWeightedValue(weight: number, position: PortfolioPosition): number {
    const baseValue = isNumber(position.valueInBaseCurrency)
      ? position.valueInBaseCurrency
      : position.valueInPercentage;
    return weight * baseValue;
  }

  private calculateHoldingValue(
    valueInBaseCurrency: number,
    allocationInPercentage: number,
    positionValueInPercentage: number
  ): number {
    return isNumber(valueInBaseCurrency)
      ? valueInBaseCurrency
      : allocationInPercentage * positionValueInPercentage;
  }

  private addToUnknownSector(
    position: PortfolioPosition,
    sectors: ISectorData['sectors']
  ): void {
    const value = isNumber(position.valueInBaseCurrency)
      ? position.valueInBaseCurrency
      : position.valueInPercentage;

    sectors[UNKNOWN_KEY].value += value;
  }
}
