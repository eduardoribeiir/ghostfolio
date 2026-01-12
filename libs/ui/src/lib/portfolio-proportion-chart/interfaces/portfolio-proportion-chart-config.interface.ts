import { DataSource } from '@prisma/client';
import { ColorScheme } from '@ghostfolio/common/types';
import { PortfolioPosition } from '@ghostfolio/common/interfaces';

export interface PortfolioProportionChartConfig {
  baseCurrency: string;
  colorScheme: ColorScheme;
  cursor: string;
  locale: string;
}

export interface PortfolioProportionChartData {
  data: {
    [symbol: string]: Pick<PortfolioPosition, 'type'> & {
      dataSource?: DataSource;
      name: string;
      value: number;
    };
  };
  keys: string[];
}

export interface PortfolioProportionChartOptions {
  isInPercent: boolean;
  maxItems?: number;
  showLabels: boolean;
}
