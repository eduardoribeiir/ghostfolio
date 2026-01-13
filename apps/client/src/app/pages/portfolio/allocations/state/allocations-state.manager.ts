import { Injectable } from '@angular/core';
import { UNKNOWN_KEY } from '@ghostfolio/common/config';
import { PortfolioDetails } from '@ghostfolio/common/interfaces';
import { IAllocationsData } from '../models/allocations-data.interface';
import { AllocationsDataTransformerService } from '../allocations-data-transformer.service';
import { GeographicDataProcessor } from '../processors/geographic-data.processor';
import { SectorDataProcessor } from '../processors/sector-data.processor';
import { SymbolDataProcessor } from '../processors/symbol-data.processor';
import { TopHoldingsProcessor } from '../processors/top-holdings.processor';
import { MarketsAdvancedProcessor } from '../processors/markets-advanced.processor';

@Injectable()
export class AllocationsStateManager {
  private data: IAllocationsData;

  public constructor(
    private transformer: AllocationsDataTransformerService,
    private geographicProcessor: GeographicDataProcessor,
    private sectorProcessor: SectorDataProcessor,
    private symbolProcessor: SymbolDataProcessor,
    private topHoldingsProcessor: TopHoldingsProcessor,
    private marketsAdvancedProcessor: MarketsAdvancedProcessor
  ) {}

  public initializeState(): void {
    this.data = {
      accounts: {},
      continents: { [UNKNOWN_KEY]: { name: UNKNOWN_KEY, value: 0 } },
      countries: { [UNKNOWN_KEY]: { name: UNKNOWN_KEY, value: 0 } },
      holdings: {},
      marketsAdvanced: this.transformer.createInitialMarketsAdvanced(),
      platforms: {},
      sectors: { [UNKNOWN_KEY]: { name: UNKNOWN_KEY, value: 0 } },
      symbols: { [UNKNOWN_KEY]: { name: UNKNOWN_KEY, symbol: UNKNOWN_KEY, value: 0 } },
      topHoldingsMap: {},
      totalValueInEtf: 0
    };
  }

  public processPortfolioData(
    portfolioDetails: PortfolioDetails,
    hasImpersonationId: boolean
  ): void {
    this.data.accounts = this.transformer.transformAccounts(
      portfolioDetails.accounts,
      hasImpersonationId
    );

    this.data.platforms = this.transformer.transformPlatforms(
      portfolioDetails.platforms,
      hasImpersonationId
    );

    for (const [symbol, position] of Object.entries(portfolioDetails.holdings)) {
      this.data.holdings[symbol] = this.transformer.transformHolding(
        position,
        hasImpersonationId
      );

      this.geographicProcessor.processCountriesData(
        position,
        this.data.continents,
        this.data.countries
      );

      this.sectorProcessor.processSectorsData(
        position,
        this.data.sectors,
        this.data.topHoldingsMap
      );

      this.symbolProcessor.processSymbolData(
        position,
        symbol,
        this.data.symbols
      );

      this.data.totalValueInEtf = this.symbolProcessor.calculateEtfValue(
        this.data.holdings[symbol],
        this.data.totalValueInEtf
      );
    }

    this.data.marketsAdvanced = this.marketsAdvancedProcessor.processMarketsAdvanced(
      this.data.marketsAdvanced,
      portfolioDetails.marketsAdvanced
    );
  }

  public getState(): IAllocationsData {
    return this.data;
  }

  public processMarketsAdvanced(
    portfolioMarketsAdvanced: PortfolioDetails['marketsAdvanced']
  ): void {
    this.data.marketsAdvanced = this.marketsAdvancedProcessor.processMarketsAdvanced(
      this.data.marketsAdvanced,
      portfolioMarketsAdvanced
    );
  }

  public getAccounts() {
    return this.data.accounts;
  }

  public getContinents() {
    return this.data.continents;
  }

  public getCountries() {
    return this.data.countries;
  }

  public getHoldings() {
    return this.data.holdings;
  }

  public getMarketsAdvanced() {
    return this.data.marketsAdvanced;
  }

  public getPlatforms() {
    return this.data.platforms;
  }

  public getSectors() {
    return this.data.sectors;
  }

  public getSymbols() {
    return this.data.symbols;
  }

  public getTopHoldingsMap() {
    return this.data.topHoldingsMap;
  }

  public getTotalValueInEtf() {
    return this.data.totalValueInEtf;
  }

  public processTopHoldings(
    portfolioDetails: PortfolioDetails,
    hasImpersonationId: boolean,
    user: any
  ): any[] {
    return this.topHoldingsProcessor.processTopHoldings(
      this.data.topHoldingsMap,
      this.data.totalValueInEtf,
      portfolioDetails.holdings,
      hasImpersonationId,
      user
    );
  }
}
