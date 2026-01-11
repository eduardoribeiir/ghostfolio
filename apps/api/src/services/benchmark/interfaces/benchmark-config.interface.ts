import { BenchmarkTrend } from '@ghostfolio/common/types';

export interface BenchmarkCalculationOptions {
  enableSharing?: boolean;
  useCache?: boolean;
}

export interface BenchmarkTrendResult {
  trend50d: BenchmarkTrend;
  trend200d: BenchmarkTrend;
}

export interface BenchmarkAssetProfile {
  dataSource: string;
  symbol: string;
  id: string;
  name?: string;
}

export interface AllTimeHighData {
  date: Date;
  marketPrice: number;
}

export interface BenchmarkProperty {
  symbolProfileId: string;
  enableSharing?: boolean;
}