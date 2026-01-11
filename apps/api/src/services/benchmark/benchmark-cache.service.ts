import { Injectable, Logger } from '@nestjs/common';
import { RedisCacheService } from '@ghostfolio/api/app/redis-cache/redis-cache.service';
import { CACHE_TTL_INFINITE } from '@ghostfolio/common/config';
import { Benchmark } from '@ghostfolio/common/interfaces';
import { addHours, isAfter } from 'date-fns';

import { BenchmarkValue } from './interfaces/benchmark-value.interface';

@Injectable()
export class BenchmarkCacheService {
  private readonly CACHE_KEY_BENCHMARKS = 'BENCHMARKS';

  public constructor(private readonly redisCacheService: RedisCacheService) {}

  public async getCachedBenchmarks(): Promise<{
    benchmarks: Benchmark[];
    expiration: Date;
  } | null> {
    try {
      const cachedBenchmarkValue = await this.redisCacheService.get(
        this.CACHE_KEY_BENCHMARKS
      );

      if (!cachedBenchmarkValue) {
        return null;
      }

      const { benchmarks, expiration }: BenchmarkValue =
        JSON.parse(cachedBenchmarkValue);

      Logger.debug('Fetched benchmarks from cache', 'BenchmarkCacheService');

      return { benchmarks, expiration: new Date(expiration) };
    } catch {
      return null;
    }
  }

  public async setCachedBenchmarks(
    benchmarks: Benchmark[],
    enableSharing: boolean
  ): Promise<void> {
    if (!enableSharing) {
      const expiration = addHours(new Date(), 2);

      await this.redisCacheService.set(
        this.CACHE_KEY_BENCHMARKS,
        JSON.stringify({
          benchmarks,
          expiration: expiration.getTime()
        } as BenchmarkValue),
        CACHE_TTL_INFINITE
      );

      Logger.debug('Benchmarks cached', 'BenchmarkCacheService');
    }
  }

  public isCacheExpired(expiration: Date): boolean {
    return isAfter(new Date(), expiration);
  }

  public async invalidateCache(): Promise<void> {
    await this.redisCacheService.remove(this.CACHE_KEY_BENCHMARKS);
    Logger.debug('Benchmarks cache invalidated', 'BenchmarkCacheService');
  }
}