import { ColorScheme, GroupBy } from '@ghostfolio/common/types';
import { InvestmentItem, LineChartItem } from '@ghostfolio/common/interfaces';

export interface InvestmentChartConfig {
  colorScheme: ColorScheme;
  currency: string;
  groupBy: GroupBy;
  locale: string;
}

export interface InvestmentChartData {
  benchmarkDataItems: InvestmentItem[];
  benchmarkDataLabel: string;
  historicalDataItems: LineChartItem[];
  savingsRate: number;
}

export interface InvestmentChartOptions {
  isInPercent: boolean;
  isLoading: boolean;
}
