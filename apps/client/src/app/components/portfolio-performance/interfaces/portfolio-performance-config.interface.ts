import { PortfolioPerformance, ResponseError } from '@ghostfolio/common/interfaces';

export interface PortfolioPerformanceConfig {
  deviceType: string;
  locale: string;
  unit: string;
}

export interface PortfolioPerformanceData {
  errors: ResponseError['errors'];
  performance: PortfolioPerformance;
}

export interface PortfolioPerformanceOptions {
  isAllTimeHigh: boolean;
  isAllTimeLow: boolean;
  isLoading: boolean;
  precision: number;
  showDetails: boolean;
}
