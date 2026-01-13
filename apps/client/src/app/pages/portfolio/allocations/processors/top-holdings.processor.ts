import { Injectable } from '@angular/core';
import { MAX_TOP_HOLDINGS } from '@ghostfolio/common/config';
import { HoldingWithParents, PortfolioDetails, User } from '@ghostfolio/common/interfaces';

@Injectable()
export class TopHoldingsProcessor {
  public processTopHoldings(
    topHoldingsMap: { [name: string]: { name: string; value: number } },
    totalValueInEtf: number,
    portfolioHoldings: PortfolioDetails['holdings'],
    hasImpersonationId: boolean,
    user: User
  ): HoldingWithParents[] {
    const holdings = Object.values(topHoldingsMap)
      .map(({ name, value }) => this.buildHolding(
        name,
        value,
        totalValueInEtf,
        portfolioHoldings,
        hasImpersonationId,
        user
      ))
      .sort((a, b) => b.allocationInPercentage - a.allocationInPercentage);

    return this.limitToMaxHoldings(holdings);
  }

  private buildHolding(
    name: string,
    value: number,
    totalValueInEtf: number,
    portfolioHoldings: PortfolioDetails['holdings'],
    hasImpersonationId: boolean,
    user: User
  ): HoldingWithParents {
    if (hasImpersonationId || user.settings.isRestrictedView) {
      return {
        name,
        allocationInPercentage: value,
        valueInBaseCurrency: null
      };
    }

    return {
      name,
      allocationInPercentage: this.calculateAllocationPercentage(value, totalValueInEtf),
      parents: this.buildParents(name, value, portfolioHoldings),
      valueInBaseCurrency: value
    };
  }

  private calculateAllocationPercentage(value: number, totalValueInEtf: number): number {
    return totalValueInEtf > 0 ? value / totalValueInEtf : 0;
  }

  private buildParents(
    name: string,
    value: number,
    portfolioHoldings: PortfolioDetails['holdings']
  ): HoldingWithParents['parents'] {
    return Object.entries(portfolioHoldings)
      .map(([, holding]) => this.buildParentHolding(holding, name, value))
      .filter(parent => parent !== null)
      .sort((a, b) => b.allocationInPercentage - a.allocationInPercentage);
  }

  private buildParentHolding(
    holding: PortfolioDetails['holdings'][string],
    name: string,
    value: number
  ): HoldingWithParents['parents'][number] | null {
    if (holding.holdings.length === 0) {
      return null;
    }

    const currentParentHolding = holding.holdings.find(
      parentHolding => parentHolding.name === name
    );

    if (!currentParentHolding) {
      return null;
    }

    return {
      allocationInPercentage: currentParentHolding.valueInBaseCurrency / value,
      name: holding.name,
      valueInBaseCurrency: currentParentHolding.valueInBaseCurrency
    };
  }

  private limitToMaxHoldings(holdings: HoldingWithParents[]): HoldingWithParents[] {
    if (holdings.length > MAX_TOP_HOLDINGS) {
      return holdings.slice(0, MAX_TOP_HOLDINGS);
    }
    return holdings;
  }
}
