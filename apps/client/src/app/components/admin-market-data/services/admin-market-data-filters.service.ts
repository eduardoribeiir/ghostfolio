import { Injectable } from '@angular/core';
import { Filter } from '@ghostfolio/common/interfaces';
import { AssetSubClass, DataSource } from '@prisma/client';
import { translate } from '@ghostfolio/ui/i18n';

/**
 * Service responsible for managing filters in the Admin Market Data page
 */
@Injectable()
export class AdminMarketDataFiltersService {
  /**
   * Get all available filters for market data
   */
  public getAllFilters(): Filter[] {
    return [
      ...this.getAssetSubClassFilters(),
      ...this.getDataSourceFilters(),
      ...this.getPresetFilters()
    ];
  }

  private getAssetSubClassFilters(): Filter[] {
    return Object.keys(AssetSubClass)
      .filter((assetSubClass) => assetSubClass !== 'CASH')
      .map((assetSubClass) => ({
        id: assetSubClass.toString(),
        label: translate(assetSubClass),
        type: 'ASSET_SUB_CLASS' as Filter['type']
      }));
  }

  private getDataSourceFilters(): Filter[] {
    return Object.keys(DataSource).map((dataSource) => ({
      id: dataSource.toString(),
      label: dataSource,
      type: 'DATA_SOURCE' as Filter['type']
    }));
  }

  private getPresetFilters(): Filter[] {
    return [
      {
        id: 'BENCHMARKS',
        label: $localize`Benchmarks`,
        type: 'PRESET_ID' as Filter['type']
      },
      {
        id: 'CURRENCIES',
        label: $localize`Currencies`,
        type: 'PRESET_ID' as Filter['type']
      },
      {
        id: 'ETF_WITHOUT_COUNTRIES',
        label: $localize`ETFs without Countries`,
        type: 'PRESET_ID' as Filter['type']
      },
      {
        id: 'ETF_WITHOUT_SECTORS',
        label: $localize`ETFs without Sectors`,
        type: 'PRESET_ID' as Filter['type']
      }
    ];
  }

  /**
   * Determine placeholder text based on active filters
   */
  public getPlaceholder(activeFilters: Filter[]): string {
    return activeFilters.length <= 0 ? $localize`Filter by...` : '';
  }

  /**
   * Check if filters should use pagination
   */
  public shouldUsePagination(activeFilters: Filter[]): boolean {
    return !(
      activeFilters.length === 1 && activeFilters[0].type === 'PRESET_ID'
    );
  }
}
