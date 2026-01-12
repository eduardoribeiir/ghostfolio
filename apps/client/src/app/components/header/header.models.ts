import { InfoItem, User } from '@ghostfolio/common/interfaces';

/**
 * Configuration object for the Header component
 * Groups related inputs to reduce component complexity
 */
export interface HeaderConfig {
  currentRoute: string;
  deviceType: string;
  pageTitle: string;
  hasTabs: boolean;
}

/**
 * Permission flags for the Header component
 * Consolidates permission-related inputs
 */
export interface HeaderPermissions {
  hasPermissionToChangeDateRange: boolean;
  hasPermissionToChangeFilters: boolean;
}

/**
 * Data model for the Header component
 * Separates data from configuration
 */
export interface HeaderData {
  info: InfoItem;
  user: User;
  hasPromotion: boolean;
}

/**
 * Complete props interface for the Header component
 * Combines all input groups
 */
export interface HeaderProps {
  config: HeaderConfig;
  permissions: HeaderPermissions;
  data: HeaderData;
}

/**
 * Default configuration values
 */
export const DEFAULT_HEADER_CONFIG: Partial<HeaderConfig> = {
  hasTabs: false,
  pageTitle: ''
};

export const DEFAULT_HEADER_PERMISSIONS: HeaderPermissions = {
  hasPermissionToChangeDateRange: false,
  hasPermissionToChangeFilters: false
};
