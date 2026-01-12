import { UNKNOWN_KEY } from '@ghostfolio/common/config';

import { Injectable } from '@angular/core';
import { Big } from 'big.js';

export interface ChartDataItem {
  name: string;
  value: Big;
  color?: string;
  subCategory?: { [key: string]: { value: Big } };
}

export interface ProcessedChartData {
  labels: string[];
  data: number[];
  backgroundColor: string[];
  subCategory?: {
    labels: string[];
    data: number[];
    backgroundColor: string[];
  };
}

/**
 * Service responsible for processing and formatting chart data
 * Extracted from portfolio-proportion-chart component
 */
@Injectable()
export class ChartDataFormatterService {
  private readonly OTHER_KEY = 'OTHER';

  /**
   * Process raw data into chart-ready format
   */
  public processChartData(params: {
    data: { [symbol: string]: any };
    keys: string[];
    isInPercent: boolean;
    maxItems?: number;
  }): Map<string, ChartDataItem> {
    const { data, keys, isInPercent } = params;
    const chartData = new Map<string, ChartDataItem>();

    // Group and calculate values
    keys.forEach((key) => {
      const item = data[key];
      if (!item) return;

      const value = new Big(item.value);

      if (chartData.has(key)) {
        const existing = chartData.get(key);
        existing.value = existing.value.plus(value);
      } else {
        chartData.set(key, {
          name: item.name || key,
          value,
          subCategory: {}
        });
      }
    });

    return chartData;
  }

  /**
   * Limit items and group surplus into "Other"
   */
  public limitItems(
    chartData: Map<string, ChartDataItem>,
    maxItems: number
  ): Map<string, ChartDataItem> {
    if (chartData.size <= maxItems) {
      return chartData;
    }

    // Sort by value
    const sorted = Array.from(chartData.entries()).sort((a, b) =>
      b[1].value.minus(a[1].value).toNumber()
    );

    // Take top items
    const topItems = sorted.slice(0, maxItems - 1);
    const restItems = sorted.slice(maxItems - 1);

    // Create "Other" category
    const otherValue = restItems.reduce(
      (sum, [, item]) => sum.plus(item.value),
      new Big(0)
    );

    const result = new Map<string, ChartDataItem>(topItems);
    result.set(this.OTHER_KEY, {
      name: this.OTHER_KEY,
      value: otherValue,
      subCategory: {}
    });

    return result;
  }

  /**
   * Sort chart data by value (descending)
   */
  public sortByValue(
    chartData: Map<string, ChartDataItem>
  ): [string, ChartDataItem][] {
    return Array.from(chartData.entries()).sort((a, b) =>
      b[1].value.minus(a[1].value).toNumber()
    );
  }

  /**
   * Handle unknown values for percentage charts
   */
  public handleUnknownValues(
    chartData: Map<string, ChartDataItem>,
    isInPercent: boolean
  ): Map<string, ChartDataItem> {
    if (!isInPercent) {
      return chartData;
    }

    const totalValue = Array.from(chartData.values()).reduce(
      (sum, item) => sum.plus(item.value),
      new Big(0)
    );

    const unknownValue = new Big(1).minus(totalValue);

    if (unknownValue.gt(0)) {
      if (chartData.has(UNKNOWN_KEY)) {
        const existing = chartData.get(UNKNOWN_KEY);
        existing.value = existing.value.plus(unknownValue);
      } else {
        chartData.set(UNKNOWN_KEY, {
          name: UNKNOWN_KEY,
          value: unknownValue,
          subCategory: {}
        });
      }
    }

    return chartData;
  }

  /**
   * Convert to final chart format
   */
  public toChartFormat(sortedData: [string, ChartDataItem][]): {
    labels: string[];
    data: number[];
  } {
    return {
      labels: sortedData.map(([key]) => key),
      data: sortedData.map(([, item]) => item.value.toNumber())
    };
  }
}
