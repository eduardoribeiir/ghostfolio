import { InfoItem } from '@ghostfolio/common/interfaces';

export interface AdminOverviewConfig {
  info: InfoItem;
}

export interface AdminOverviewPermissions {
  hasPermissionForSubscription: boolean;
  hasPermissionForSystemMessage: boolean;
  hasPermissionToSyncDemoUserAccount: boolean;
  hasPermissionToToggleReadOnlyMode: boolean;
}
