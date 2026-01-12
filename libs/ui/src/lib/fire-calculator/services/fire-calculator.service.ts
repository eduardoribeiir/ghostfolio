import { Injectable } from '@angular/core';
import { FireProjectionData, FireCalculationResult } from './fire-calculator.models';
import { addMonths, differenceInMonths } from 'date-fns';

/**
 * Service for FIRE (Financial Independence, Retire Early) calculations
 * Extracted from component to improve testability and reusability
 */
@Injectable()
export class FireCalculatorService {
  /**
   * Calculate the complete FIRE projection
   */
  public calculateProjection(params: {
    principalAmount: number;
    monthlyContribution: number;
    annualInterestRate: number;
    retirementDate: Date;
    currentDate?: Date;
  }): FireCalculationResult {
    const {
      principalAmount,
      monthlyContribution,
      annualInterestRate,
      retirementDate,
      currentDate = new Date()
    } = params;

    const monthlyRate = annualInterestRate / 12;
    const totalMonths = differenceInMonths(retirementDate, currentDate);
    
    const projectionData = this.generateProjectionData({
      principalAmount,
      monthlyContribution,
      monthlyRate,
      totalMonths,
      startDate: currentDate
    });

    const finalBalance = projectionData[projectionData.length - 1]?.balance || 0;
    const totalContributions = monthlyContribution * totalMonths;
    const totalInterest = finalBalance - principalAmount - totalContributions;

    return {
      yearsToRetirement: totalMonths / 12,
      monthlyContribution,
      totalSavingsNeeded: finalBalance,
      currentProgress: (principalAmount / finalBalance) * 100,
      projectionData
    };
  }

  /**
   * Calculate required monthly savings to reach a goal
   */
  public calculateRequiredMonthlySavings(params: {
    currentAmount: number;
    targetAmount: number;
    annualInterestRate: number;
    monthsUntilRetirement: number;
  }): number {
    const { currentAmount, targetAmount, annualInterestRate, monthsUntilRetirement } = params;
    
    const monthlyRate = annualInterestRate / 12;
    
    if (monthlyRate === 0) {
      return (targetAmount - currentAmount) / monthsUntilRetirement;
    }

    // Future value of current principal
    const futureValueOfPrincipal = currentAmount * Math.pow(1 + monthlyRate, monthsUntilRetirement);
    
    // Remaining amount needed from contributions
    const remainingNeeded = targetAmount - futureValueOfPrincipal;
    
    // Calculate monthly payment using annuity formula
    const monthlyPayment = remainingNeeded * (monthlyRate / (Math.pow(1 + monthlyRate, monthsUntilRetirement) - 1));
    
    return Math.max(0, monthlyPayment);
  }

  /**
   * Calculate retirement corpus needed based on withdrawal rate
   */
  public calculateRetirementCorpus(params: {
    annualExpenses: number;
    withdrawalRate: number;
  }): number {
    const { annualExpenses, withdrawalRate } = params;
    return annualExpenses / withdrawalRate;
  }

  /**
   * Generate month-by-month projection data
   */
  private generateProjectionData(params: {
    principalAmount: number;
    monthlyContribution: number;
    monthlyRate: number;
    totalMonths: number;
    startDate: Date;
  }): FireProjectionData[] {
    const { principalAmount, monthlyContribution, monthlyRate, totalMonths, startDate } = params;
    
    const data: FireProjectionData[] = [];
    let balance = principalAmount;
    let totalContributions = 0;
    let totalInterest = 0;

    for (let month = 0; month <= totalMonths; month++) {
      const monthlyInterest = balance * monthlyRate;
      
      if (month > 0) {
        balance += monthlyContribution + monthlyInterest;
        totalContributions += monthlyContribution;
        totalInterest += monthlyInterest;
      }

      data.push({
        date: addMonths(startDate, month),
        balance: Math.round(balance * 100) / 100,
        contributions: Math.round(totalContributions * 100) / 100,
        interest: Math.round(totalInterest * 100) / 100
      });
    }

    return data;
  }

  /**
   * Validate calculation inputs
   */
  public validateInputs(params: {
    principalAmount: number;
    monthlyContribution: number;
    annualInterestRate: number;
    retirementDate: Date;
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (params.principalAmount < 0) {
      errors.push('Principal amount cannot be negative');
    }

    if (params.monthlyContribution < 0) {
      errors.push('Monthly contribution cannot be negative');
    }

    if (params.annualInterestRate < 0 || params.annualInterestRate > 1) {
      errors.push('Interest rate must be between 0 and 100%');
    }

    if (params.retirementDate <= new Date()) {
      errors.push('Retirement date must be in the future');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
