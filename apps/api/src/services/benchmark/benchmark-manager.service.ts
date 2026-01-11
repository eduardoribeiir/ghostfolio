import { Injectable } from '@nestjs/common';
import { PrismaService } from '@ghostfolio/api/services/prisma/prisma.service';
import { PropertyService } from '@ghostfolio/api/services/property/property.service';
import { SymbolProfileService } from '@ghostfolio/api/services/symbol-profile/symbol-profile.service';
import { PROPERTY_BENCHMARKS } from '@ghostfolio/common/config';
import { AssetProfileIdentifier } from '@ghostfolio/common/interfaces';
import { SymbolProfile } from '@prisma/client';
import { uniqBy } from 'lodash';

import { BenchmarkProperty } from './interfaces/benchmark-config.interface';

@Injectable()
export class BenchmarkManagerService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly propertyService: PropertyService,
    private readonly symbolProfileService: SymbolProfileService
  ) {}

  public async getBenchmarkAssetProfiles({
    enableSharing = false
  }: {
    enableSharing?: boolean;
  } = {}): Promise<Partial<SymbolProfile>[]> {
    const symbolProfileIds: string[] = (
      (await this.propertyService.getByKey<BenchmarkProperty[]>(
        PROPERTY_BENCHMARKS
      )) ?? []
    )
      .filter((benchmark) => {
        if (enableSharing) {
          return benchmark.enableSharing;
        }
        return true;
      })
      .map(({ symbolProfileId }) => {
        return symbolProfileId;
      });

    const assetProfiles =
      await this.symbolProfileService.getSymbolProfilesByIds(symbolProfileIds);

    return assetProfiles
      .map(({ dataSource, id, name, symbol }) => {
        return {
          dataSource,
          id,
          name,
          symbol
        };
      })
      .sort((a, b) => {
        return a.name?.localeCompare(b?.name) ?? 0;
      });
  }

  public async addBenchmark({
    dataSource,
    symbol
  }: AssetProfileIdentifier): Promise<Partial<SymbolProfile>> {
    const assetProfile = await this.prismaService.symbolProfile.findFirst({
      where: {
        dataSource,
        symbol
      }
    });

    if (!assetProfile) {
      return null;
    }

    let benchmarks =
      (await this.propertyService.getByKey<BenchmarkProperty[]>(
        PROPERTY_BENCHMARKS
      )) ?? [];

    benchmarks.push({ symbolProfileId: assetProfile.id });

    benchmarks = uniqBy(benchmarks, 'symbolProfileId');

    await this.propertyService.put({
      key: PROPERTY_BENCHMARKS,
      value: JSON.stringify(benchmarks)
    });

    return {
      dataSource,
      symbol,
      id: assetProfile.id,
      name: assetProfile.name
    };
  }

  public async deleteBenchmark({
    dataSource,
    symbol
  }: AssetProfileIdentifier): Promise<Partial<SymbolProfile>> {
    const assetProfile = await this.prismaService.symbolProfile.findFirst({
      where: {
        dataSource,
        symbol
      }
    });

    if (!assetProfile) {
      return null;
    }

    let benchmarks =
      (await this.propertyService.getByKey<BenchmarkProperty[]>(
        PROPERTY_BENCHMARKS
      )) ?? [];

    benchmarks = benchmarks.filter(({ symbolProfileId }) => {
      return symbolProfileId !== assetProfile.id;
    });

    await this.propertyService.put({
      key: PROPERTY_BENCHMARKS,
      value: JSON.stringify(benchmarks)
    });

    return {
      dataSource,
      symbol,
      id: assetProfile.id,
      name: assetProfile.name
    };
  }
}