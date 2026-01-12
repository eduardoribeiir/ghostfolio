import { LineChartItem } from '@ghostfolio/common/interfaces';
import { ColorScheme } from '@ghostfolio/common/types';

export interface LineChartConfig {
  colorScheme: ColorScheme;
  currency: string;
  locale: string;
  unit: string;
}

export interface LineChartData {
  benchmarkDataItems: LineChartItem[];
  benchmarkLabel: string;
  historicalDataItems: LineChartItem[];
  label: string;
  yMax: number;
  yMaxLabel: string;
  yMin: number;
  yMinLabel: string;
}

export interface LineChartOptions {
  isAnimated: boolean;
  showGradient: boolean;
  showLegend: boolean;
  showLoader: boolean;
  showXAxis: boolean;
  showYAxis: boolean;
}
