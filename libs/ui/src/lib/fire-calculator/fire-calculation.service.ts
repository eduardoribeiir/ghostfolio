import { Injectable } from '@angular/core';
import { differenceInMonths, addMonths, getMonth } from 'date-fns';

export interface FireCalculationParams {
  principalAmount: number;
  annualInterestRate: number;
  paymentPerPeriod: number;
  retirementDate: Date;
}

export interface FireCalculationResult {
  periodsToRetire: number;
  projectedTotalAmount: number;
  yearsToRetire: number;
  monthlyPayment: number;
}

export interface ChartDataPoint {
  year: number;
  deposit: number;
  savings: number;
  interest: number;
  total: number;
}

/**
 * Service responsible for FIRE (Financial Independence, Retire Early) calculations
 * Extracted from fire-calculator component for better testability and reusability
 */
@Injectable()
export class FireCalculationService {
  /**
   * Calculate payment per period (PMT) using the annuity formula
   * PMT = (FV - PV(1+r)^n) * (r / ((1+r)^n - 1))
   */
  public calculatePaymentPerPeriod(params: {
    principalAmount: number;
    futureValue: number;
    annualInterestRate: number;
    periods: number;
  }): number {
    const { principalAmount, futureValue, annualInterestRate, periods } = params;

    if (periods <= 0) {
      return 0;
    }

    const monthlyRate = annualInterestRate / 12;

    if (monthlyRate === 0) {
      return (futureValue - principalAmount) / periods;
    }

    const futureValueOfPrincipal =
      principalAmount * Math.pow(1 + monthlyRate, periods);
    const remainingAmount = futureValue - futureValueOfPrincipal;

    const payment =
      remainingAmount *
      (monthlyRate / (Math.pow(1 + monthlyRate, periods) - 1));

    return Math.max(0, payment);
  }

  /**
   * Calculate future value (FV) given principal, payment, rate, and time
   * FV = PV(1+r)^n + PMT * (((1+r)^n - 1) / r)
   */
  public calculateFutureValue(params: {
    principalAmount: number;
    paymentPerPeriod: number;
    annualInterestRate: number;
    periods: number;
  }): number {
    const { principalAmount, paymentPerPeriod, annualInterestRate, periods } =
      params;

    const monthlyRate = annualInterestRate / 12;

    if (monthlyRate === 0) {
      return principalAmount + paymentPerPeriod * periods;
    }

    const futureValueOfPrincipal =
      principalAmount * Math.pow(1 + monthlyRate, periods);
    const futureValueOfAnnuity =
      paymentPerPeriod *
      ((Math.pow(1 + monthlyRate, periods) - 1) / monthlyRate);

    return futureValueOfPrincipal + futureValueOfAnnuity;
  }

  /**
   * Calculate number of periods until retirement
   */
  public calculatePeriodsToRetire(
    currentDate: Date,
    retirementDate: Date
  ): number {
    if (!retirementDate) {
      return 0;
    }

    const months = differenceInMonths(retirementDate, currentDate);
    return Math.max(0, months);
  }

  /**
   * Calculate years to retirement
   */
  public calculateYearsToRetire(
    currentDate: Date,
    retirementDate: Date
  ): number {
    const periods = this.calculatePeriodsToRetire(currentDate, retirementDate);
    return Math.ceil(periods / 12);
  }

  /**
   * Generate chart data for visualization
   */
  public generateChartData(params: {
    principalAmount: number;
    paymentPerPeriod: number;
    annualInterestRate: number;
    retirementDate: Date;
    currentDate?: Date;
  }): ChartDataPoint[] {
    const {
      principalAmount,
      paymentPerPeriod,
      annualInterestRate,
      retirementDate,
      currentDate = new Date()
    } = params;

    const monthlyRate = annualInterestRate / 12;
    const currentYear = currentDate.getFullYear();
    const yearsToRetire = this.calculateYearsToRetire(
      currentDate,
      retirementDate
    );

    const data: ChartDataPoint[] = [];
    let balance = principalAmount;
    let totalDeposit = principalAmount;
    let totalSavings = 0;
    let totalInterest = 0;

    const monthsPassedInCurrentYear = getMonth(currentDate);

    for (let year = 0; year < yearsToRetire; year++) {
      const currentYearValue = currentYear + year;
      const monthsInYear =
        year === 0 ? 12 - monthsPassedInCurrentYear : 12;

      let yearlyDeposit = 0;
      let yearlySavings = 0;
      let yearlyInterest = 0;

      for (let month = 0; month < monthsInYear; month++) {
        const interest = balance * monthlyRate;
        balance += interest + paymentPerPeriod;

        yearlyInterest += interest;
        yearlySavings += paymentPerPeriod;
      }

      totalInterest += yearlyInterest;
      totalSavings += yearlySavings;
      totalDeposit = principalAmount;

      data.push({
        year: currentYearValue,
        deposit: totalDeposit,
        savings: totalSavings,
        interest: totalInterest,
        total: totalDeposit + totalSavings + totalInterest
      });
    }

    return data;
  }

  /**
   * Calculate complete FIRE metrics
   */
  public calculate(params: FireCalculationParams): FireCalculationResult {
    const currentDate = new Date();
    const periodsToRetire = this.calculatePeriodsToRetire(
      currentDate,
      params.retirementDate
    );
    const yearsToRetire = this.calculateYearsToRetire(
      currentDate,
      params.retirementDate
    );

    // If payment is not provided, calculate projected amount
    // If projected amount is not provided, calculate it based on payment
    let projectedTotalAmount = 0;
    let monthlyPayment = params.paymentPerPeriod;

    if (params.paymentPerPeriod > 0) {
      projectedTotalAmount = this.calculateFutureValue({
        principalAmount: params.principalAmount,
        paymentPerPeriod: params.paymentPerPeriod,
        annualInterestRate: params.annualInterestRate,
        periods: periodsToRetire
      });
    }

    return {
      periodsToRetire,
      projectedTotalAmount: Math.round(projectedTotalAmount),
      yearsToRetire,
      monthlyPayment
    };
  }

  /**
   * Validate calculation inputs
   */
  public validateInputs(params: Partial<FireCalculationParams>): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (
      params.principalAmount !== undefined &&
      params.principalAmount < 0
    ) {
      errors.push('Principal amount cannot be negative');
    }

    if (
      params.paymentPerPeriod !== undefined &&
      params.paymentPerPeriod < 0
    ) {
      errors.push('Payment per period cannot be negative');
    }

    if (
      params.annualInterestRate !== undefined &&
      (params.annualInterestRate < 0 || params.annualInterestRate > 1)
    ) {
      errors.push('Interest rate must be between 0 and 100%');
    }

    if (params.retirementDate && params.retirementDate <= new Date()) {
      errors.push('Retirement date must be in the future');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
