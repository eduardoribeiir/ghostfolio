import { Injectable, Logger } from '@nestjs/common';
import { BenchmarkCalculatorService } from './benchmark-calculator.service';
import { BenchmarkCacheService } from './benchmark-cache.service';
import { BenchmarkManagerService } from './benchmark-manager.service';
import { BenchmarkTrendService } from './benchmark-trend.service';
import { Benchmark } from '@ghostfolio/common/interfaces';

@Injectable()
export class BenchmarkService {
  public constructor(
    private readonly benchmarkCalculator: BenchmarkCalculatorService,
    private readonly benchmarkCache: BenchmarkCacheService,
    private readonly benchmarkManager: BenchmarkManagerService,
    private readonly benchmarkTrend: BenchmarkTrendService
  ) {}

  public async getBenchmarks({
    enableSharing = false,
    useCache = true
  } = {}): Promise<Benchmark[]> {
    if (useCache) {
      const cached = await this.benchmarkCache.getCachedBenchmarks();
      
      if (cached) {
        if (this.benchmarkCache.isCacheExpired(cached.expiration)) {
          this.calculateAndCacheBenchmarks({ enableSharing });
        }
        return cached.benchmarks;
      }
    }

    return this.calculateAndCacheBenchmarks({ enableSharing });
  }

  public async addBenchmark(identifier: any): Promise<any> {
    return this.benchmarkManager.addBenchmark(identifier);
  }

  public async deleteBenchmark(identifier: any): Promise<any> {
    return this.benchmarkManager.deleteBenchmark(identifier);
  }

  public async getBenchmarkAssetProfiles(options: {
    enableSharing?: boolean;
  } = {}): Promise<any[]> {
    return this.benchmarkManager.getBenchmarkAssetProfiles(options);
  }

  public getMarketCondition(performanceInPercent: number): string {
    return this.benchmarkCalculator.getMarketCondition(performanceInPercent);
  }

  public calculateChangeInPercentage(
    baseValue: number,
    currentValue: number
  ): number {
    return this.benchmarkCalculator.calculateChangeInPercentage(
      baseValue,
      currentValue
    );
  }

  public async getBenchmarkTrends(identifier: any): Promise<any> {
    return this.benchmarkTrend.getBenchmarkTrends(identifier);
  }

  private async calculateAndCacheBenchmarks({
    enableSharing = false
  }): Promise<Benchmark[]> {
    Logger.debug('Calculate benchmarks', 'BenchmarkService');

    const benchmarkAssetProfiles = await this.benchmarkManager.getBenchmarkAssetProfiles({
      enableSharing
    });

    const benchmarkTrends = await this.benchmarkTrend.getMultipleBenchmarkTrends(
      benchmarkAssetProfiles
    );

    const benchmarks = await this.benchmarkCalculator.calculateBenchmarks(
      benchmarkAssetProfiles,
      benchmarkTrends
    );

    await this.benchmarkCache.setCachedBenchmarks(benchmarks, enableSharing);

    return benchmarks;
  }
}