import { Injectable } from '@nestjs/common';
import { MarketDataService } from '@ghostfolio/api/services/market-data/market-data.service';
import { calculateBenchmarkTrend } from '@ghostfolio/common/helper';
import { AssetProfileIdentifier } from '@ghostfolio/common/interfaces';
import { subDays } from 'date-fns';

import { BenchmarkTrendResult } from './interfaces/benchmark-config.interface';

@Injectable()
export class BenchmarkTrendService {
  public constructor(
    private readonly marketDataService: MarketDataService
  ) {}

  public async getBenchmarkTrends({
    dataSource,
    symbol
  }: AssetProfileIdentifier): Promise<BenchmarkTrendResult> {
    const historicalData = await this.marketDataService.marketDataItems({
      orderBy: {
        date: 'desc'
      },
      where: {
        dataSource,
        symbol,
        date: { gte: subDays(new Date(), 400) }
      }
    });

    const fiftyDayAverage = calculateBenchmarkTrend({
      historicalData,
      days: 50
    });
    const twoHundredDayAverage = calculateBenchmarkTrend({
      historicalData,
      days: 200
    });

    return { trend50d: fiftyDayAverage, trend200d: twoHundredDayAverage };
  }

  public async getMultipleBenchmarkTrends(
    identifiers: AssetProfileIdentifier[]
  ): Promise<BenchmarkTrendResult[]> {
    const promises = identifiers.map((identifier) =>
      this.getBenchmarkTrends(identifier)
    );
    return await Promise.all(promises);
  }
}