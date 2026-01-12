import { Injectable, ElementRef } from '@angular/core';
import { ColorScheme } from '@ghostfolio/common/types';
import { primaryColorRgb } from '@ghostfolio/common/config';
import {
  getTooltipOptions,
  transformTickToAbbreviation
} from '@ghostfolio/common/chart-helper';
import {
  Chart,
  ChartConfiguration,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip
} from 'chart.js';
import Color from 'color';
import { getMonth } from 'date-fns';

/**
 * Service responsible for managing the FIRE calculator chart
 * Extracted from fire-calculator component to reduce complexity
 */
@Injectable()
export class FireChartService {
  private chart: Chart<'bar'>;

  public constructor() {
    Chart.register(
      BarController,
      BarElement,
      CategoryScale,
      LinearScale,
      Tooltip
    );
  }

  public initializeChart(
    chartCanvas: ElementRef<HTMLCanvasElement>,
    colorScheme: ColorScheme,
    locale: string,
    currency: string
  ): Chart<'bar'> {
    if (this.chart) {
      this.chart.destroy();
    }

    const config = this.getChartConfiguration(colorScheme, locale, currency);
    this.chart = new Chart(chartCanvas.nativeElement, config);
    return this.chart;
  }

  public updateChartData(params: {
    principalInvestmentAmount: number;
    paymentPerPeriod: number;
    periods: number;
    annualInterestRate: number;
    retirementDate: Date;
  }): void {
    if (!this.chart) {
      return;
    }

    const chartData = this.generateChartData(params);
    
    this.chart.data.labels = chartData.labels;
    this.chart.data.datasets[0].data = chartData.principalData;
    this.chart.data.datasets[1].data = chartData.savingsData;
    this.chart.data.datasets[2].data = chartData.interestData;
    
    this.chart.update();
  }

  public destroyChart(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  private generateChartData(params: {
    principalInvestmentAmount: number;
    paymentPerPeriod: number;
    periods: number;
    annualInterestRate: number;
    retirementDate: Date;
  }): {
    labels: number[];
    principalData: number[];
    savingsData: number[];
    interestData: number[];
  } {
    const {
      principalInvestmentAmount,
      paymentPerPeriod,
      periods,
      annualInterestRate,
      retirementDate
    } = params;

    const labels: number[] = [];
    const principalData: number[] = [];
    const savingsData: number[] = [];
    const interestData: number[] = [];

    const monthlyRate = annualInterestRate / 12;
    const currentYear = new Date().getFullYear();
    const yearsToRetire = Math.ceil(periods / 12);
    const monthsPassedInCurrentYear = getMonth(new Date());

    let totalPrincipal = principalInvestmentAmount;
    let totalSavings = 0;
    let totalInterest = 0;

    for (let year = 0; year < yearsToRetire; year++) {
      const currentYearValue = currentYear + year;
      const monthsInYear = year === 0 ? 12 - monthsPassedInCurrentYear : 12;

      let yearlyInterest = 0;
      let yearlySavings = 0;

      for (let month = 0; month < monthsInYear; month++) {
        const interest = (totalPrincipal + totalSavings) * monthlyRate;
        totalInterest += interest;
        totalSavings += paymentPerPeriod;
        yearlyInterest += interest;
        yearlySavings += paymentPerPeriod;
      }

      labels.push(currentYearValue);
      principalData.push(Math.round(totalPrincipal));
      savingsData.push(Math.round(totalSavings));
      interestData.push(Math.round(totalInterest));
    }

    return {
      labels,
      principalData,
      savingsData,
      interestData
    };
  }

  private getChartConfiguration(
    colorScheme: ColorScheme,
    locale: string,
    currency: string
  ): ChartConfiguration<'bar'> {
    const primaryColor =
      colorScheme === 'LIGHT'
        ? Color(`rgb(${primaryColorRgb.r}, ${primaryColorRgb.g}, ${primaryColorRgb.b})`)
        : Color('#ffffff');

    return {
      type: 'bar',
      data: {
        labels: [],
        datasets: [
          {
            backgroundColor: primaryColor.lighten(0.5).hex(),
            data: [],
            label: $localize`Principal`
          },
          {
            backgroundColor: primaryColor.lighten(0.25).hex(),
            data: [],
            label: $localize`Savings`
          },
          {
            backgroundColor: primaryColor.hex(),
            data: [],
            label: $localize`Interest`
          }
        ]
      },
      options: {
        plugins: {
          tooltip: getTooltipOptions({
            currency,
            locale
          })
        },
        responsive: true,
        scales: {
          x: {
            stacked: true
          },
          y: {
            stacked: true,
            ticks: {
              callback: (value: number) => {
                return transformTickToAbbreviation(value);
              }
            }
          }
        }
      }
    };
  }

  public getChart(): Chart<'bar'> {
    return this.chart;
  }
}
