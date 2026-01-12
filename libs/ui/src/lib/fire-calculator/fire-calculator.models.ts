import { ColorScheme } from '@ghostfolio/common/types';

/**
 * Configuration for FIRE (Financial Independence, Retire Early) Calculator
 * Consolidates all calculator inputs into a single object
 */
export interface FireCalculatorConfig {
  // Financial parameters
  financial: {
    annualInterestRate: number;
    paymentPerPeriod: number;
    principalInvestmentAmount: number;
    projectedTotalAmount: number;
    withdrawalRatePerYear: number;
  };
  
  // Time parameters
  time: {
    retirementDate: Date;
  };
  
  // Display configuration
  display: {
    colorScheme: ColorScheme;
    deviceType: string;
    isLoading: boolean;
    locale: string;
  };
  
  // Feature flags
  features: {
    hasPermissionToUpdateUserSettings: boolean;
  };
}

/**
 * Default configuration values for the FIRE calculator
 */
export const DEFAULT_FIRE_CONFIG: Partial<FireCalculatorConfig> = {
  financial: {
    annualInterestRate: 0.05,
    paymentPerPeriod: 0,
    principalInvestmentAmount: 0,
    projectedTotalAmount: 0,
    withdrawalRatePerYear: 0.04
  },
  display: {
    colorScheme: 'light',
    deviceType: 'web',
    isLoading: false,
    locale: 'en-US'
  },
  features: {
    hasPermissionToUpdateUserSettings: false
  }
};

/**
 * Result of FIRE calculation
 */
export interface FireCalculationResult {
  yearsToRetirement: number;
  monthlyContribution: number;
  totalSavingsNeeded: number;
  currentProgress: number;
  projectionData: FireProjectionData[];
}

/**
 * Data point for projection chart
 */
export interface FireProjectionData {
  date: Date;
  balance: number;
  contributions: number;
  interest: number;
}
