import { PortfolioSummary, User } from '@ghostfolio/common/interfaces';

export interface PortfolioSummaryConfig {
  baseCurrency: string;
  deviceType: string;
  language: string;
  locale: string;
}

export interface PortfolioSummaryData {
  summary: PortfolioSummary;
  user: User;
}

export interface PortfolioSummaryOptions {
  hasImpersonationId: boolean;
  hasPermissionToUpdateUserSettings: boolean;
  isLoading: boolean;
}
