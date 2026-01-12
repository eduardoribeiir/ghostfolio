import { Account } from '@prisma/client';

export interface AccountsTableConfig {
  baseCurrency: string;
  deviceType: string;
  locale: string;
}

export interface AccountsTableData {
  accounts: Account[];
  totalBalanceInBaseCurrency: number;
  totalValueInBaseCurrency: number;
  transactionCount: number;
}

export interface AccountsTableOptions {
  hasPermissionToOpenDetails: boolean;
  showActions: boolean;
  showAllocationInPercentage: boolean;
  showBalance: boolean;
  showFooter: boolean;
  showTransactions: boolean;
  showValue: boolean;
  showValueInBaseCurrency: boolean;
}
