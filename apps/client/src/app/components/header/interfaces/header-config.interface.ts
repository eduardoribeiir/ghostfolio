import { InfoItem, User } from '@ghostfolio/common/interfaces';

export interface HeaderConfig {
  currentRoute: string;
  deviceType: string;
  pageTitle: string;
}

export interface HeaderPermissions {
  hasPermissionToChangeDateRange: boolean;
  hasPermissionToChangeFilters: boolean;
}

export interface HeaderDisplayOptions {
  hasPromotion: boolean;
  hasTabs: boolean;
  info: InfoItem;
  user: User;
}
