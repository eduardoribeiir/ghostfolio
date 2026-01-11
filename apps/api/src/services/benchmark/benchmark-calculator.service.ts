import { Injectable } from '@nestjs/common';
import { DataProviderService } from '@ghostfolio/api/services/data-provider/data-provider.service';
import { MarketDataService } from '@ghostfolio/api/services/market-data/market-data.service';
import { Benchmark } from '@ghostfolio/common/interfaces';
import { SymbolProfile } from '@prisma/client';
import { Big } from 'big.js';
import ms from 'ms';

import { BenchmarkTrendResult } from './interfaces/benchmark-config.interface';

@Injectable()
export class BenchmarkCalculatorService {
  public constructor(
    private readonly dataProviderService: DataProviderService,
    private readonly marketDataService: MarketDataService
  ) {}

  public calculateChangeInPercentage(
    baseValue: number,
    currentValue: number
  ): number {
    if (baseValue && currentValue) {
      return new Big(currentValue).div(baseValue).minus(1).toNumber();
    }
    return 0;
  }

  public getMarketCondition(
    performanceInPercent: number
  ): Benchmark['marketCondition'] {
    if (performanceInPercent >= 0) {
      return 'ALL_TIME_HIGH';
    } else if (performanceInPercent <= -0.2) {
      return 'BEAR_MARKET';
    } else {
      return 'NEUTRAL_MARKET';
    }
  }

  public async calculateBenchmarks(
    benchmarkAssetProfiles: Partial<SymbolProfile>[],
    benchmarkTrends: BenchmarkTrendResult[]
  ): Promise<Benchmark[]> {
    const promisesAllTimeHighs = benchmarkAssetProfiles.map(
      ({ dataSource, symbol }) =>
        this.marketDataService.getMax({ dataSource, symbol })
    );

    const quotes = await this.dataProviderService.getQuotes({
      items: benchmarkAssetProfiles.map(({ dataSource, symbol }) => {
        return { dataSource, symbol };
      }),
      requestTimeout: ms('30 seconds'),
      useCache: false
    });

    const allTimeHighs = await Promise.all(promisesAllTimeHighs);
    let storeInCache = true;

    const benchmarks = allTimeHighs.map((allTimeHigh, index) => {
      const { marketPrice } =
        quotes[benchmarkAssetProfiles[index].symbol] ?? {};

      let performancePercentFromAllTimeHigh = 0;

      if (allTimeHigh?.marketPrice && marketPrice) {
        performancePercentFromAllTimeHigh = this.calculateChangeInPercentage(
          allTimeHigh.marketPrice,
          marketPrice
        );
      } else {
        storeInCache = false;
      }

      return {
        dataSource: benchmarkAssetProfiles[index].dataSource,
        marketCondition: this.getMarketCondition(
          performancePercentFromAllTimeHigh
        ),
        name: benchmarkAssetProfiles[index].name,
        performances: {
          allTimeHigh: {
            date: allTimeHigh?.date,
            performancePercent:
              performancePercentFromAllTimeHigh >= 0
                ? 0
                : performancePercentFromAllTimeHigh
          }
        },
        symbol: benchmarkAssetProfiles[index].symbol,
        trend50d: benchmarkTrends[index].trend50d,
        trend200d: benchmarkTrends[index].trend200d
      };
    });

    return benchmarks;
  }
}