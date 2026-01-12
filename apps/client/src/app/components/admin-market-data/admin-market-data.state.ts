import { Filter } from '@ghostfolio/common/interfaces';
import { AdminMarketDataItem } from '@ghostfolio/common/interfaces/admin-market-data.interface';
import { AssetProfileIdentifier } from '@ghostfolio/common/interfaces';
import { SortDirection } from '@angular/material/sort';

export interface AdminMarketDataState {
  data: AdminMarketDataItem[];
  totalItems: number;
  isLoading: boolean;
  activeFilters: Filter[];
  pageSize?: number;
  pageIndex: number;
  sortColumn?: string;
  sortDirection?: SortDirection;
}

export interface AdminMarketDataConfig {
  hasPermissionForSubscription: boolean;
  defaultDateFormat: string;
  deviceType: string;
}

export const INITIAL_ADMIN_MARKET_DATA_STATE: AdminMarketDataState = {
  data: [],
  totalItems: 0,
  isLoading: false,
  activeFilters: [],
  pageIndex: 0
};
