import { ColorScheme } from '@ghostfolio/common/types';

export interface FireCalculatorConfig {
  colorScheme: ColorScheme;
  currency: string;
  deviceType: string;
  locale: string;
}

export interface FireCalculatorValues {
  annualInterestRate: number;
  fireWealth: number;
  projectedTotalAmount: number;
  retirementDate: Date;
  savingsRate: number;
}

export interface FireCalculatorPermissions {
  hasPermissionToUpdateUserSettings: boolean;
}
