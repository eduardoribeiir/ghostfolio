import { DataSource, Account, Platform } from '@prisma/client';
import { PortfolioPosition } from '@ghostfolio/common/interfaces';
import { MarketAdvanced } from '@ghostfolio/common/types';

export interface IAllocationsData {
  accounts: {
    [id: string]: Pick<Account, 'name'> & { id: string; value: number };
  };
  continents: {
    [name: string]: { name: string; value: number };
  };
  countries: {
    [name: string]: { name: string; value: number };
  };
  holdings: {
    [symbol: string]: Pick<
      PortfolioPosition,
      | 'assetClass'
      | 'assetClassLabel'
      | 'assetSubClass'
      | 'assetSubClassLabel'
      | 'currency'
      | 'exchange'
      | 'name'
    > & { etfProvider: string; value: number };
  };
  marketsAdvanced: {
    [key in MarketAdvanced]: {
      id: MarketAdvanced;
      name: string;
      value: number;
    };
  };
  platforms: {
    [id: string]: Pick<Platform, 'name'> & { id: string; value: number };
  };
  sectors: {
    [name: string]: { name: string; value: number };
  };
  symbols: {
    [name: string]: {
      dataSource?: DataSource;
      name: string;
      symbol: string;
      value: number;
    };
  };
  topHoldingsMap: {
    [name: string]: { name: string; value: number };
  };
  totalValueInEtf: number;
}

export interface IGeographicData {
  continents: IAllocationsData['continents'];
  countries: IAllocationsData['countries'];
}

export interface ISectorData {
  sectors: IAllocationsData['sectors'];
  topHoldingsMap: IAllocationsData['topHoldingsMap'];
}
