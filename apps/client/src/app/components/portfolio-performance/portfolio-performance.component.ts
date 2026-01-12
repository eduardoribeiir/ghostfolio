import {
  getLocale,
  getNumberFormatDecimal,
  getNumberFormatGroup
} from '@ghostfolio/common/helper';
import {
  PortfolioPerformance,
  ResponseError
} from '@ghostfolio/common/interfaces';
import { NotificationService } from '@ghostfolio/ui/notifications';
import { GfValueComponent } from '@ghostfolio/ui/value';

import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  ViewChild
} from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { CountUp } from 'countup.js';
import { addIcons } from 'ionicons';
import { timeOutline } from 'ionicons/icons';
import { isNumber } from 'lodash';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

import {
  PortfolioPerformanceConfig,
  PortfolioPerformanceData,
  PortfolioPerformanceOptions
} from './interfaces/portfolio-performance-config.interface';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, GfValueComponent, IonIcon, NgxSkeletonLoaderModule],
  selector: 'gf-portfolio-performance',
  styleUrls: ['./portfolio-performance.component.scss'],
  templateUrl: './portfolio-performance.component.html'
})
export class GfPortfolioPerformanceComponent implements OnChanges {
  @Input() config: PortfolioPerformanceConfig;
  @Input() data: PortfolioPerformanceData;
  @Input() options: PortfolioPerformanceOptions;

  @ViewChild('value') value: ElementRef;

  public constructor(private notificationService: NotificationService) {
    addIcons({ timeOutline });
  }

  public get deviceType(): string {
    return this.config?.deviceType;
  }

  public get errors(): ResponseError['errors'] {
    return this.data?.errors;
  }

  public get isAllTimeHigh(): boolean {
    return this.options?.isAllTimeHigh;
  }

  public get isAllTimeLow(): boolean {
    return this.options?.isAllTimeLow;
  }

  public get isLoading(): boolean {
    return this.options?.isLoading;
  }

  public get locale(): string {
    return this.config?.locale ?? getLocale();
  }

  public get performance(): PortfolioPerformance {
    return this.data?.performance;
  }

  public get precision(): number {
    return this.options?.precision ?? 2;
  }

  public set precision(value: number) {
    if (this.options) {
      this.options.precision = value;
    }
  }

  public get showDetails(): boolean {
    return this.options?.showDetails;
  }

  public get unit(): string {
    return this.config?.unit;
  }

  public ngOnChanges() {
    this.precision = this.precision >= 0 ? this.precision : 2;

    if (this.isLoading) {
      if (this.value?.nativeElement) {
        this.value.nativeElement.innerHTML = '';
      }
    } else {
      if (isNumber(this.performance?.currentValueInBaseCurrency)) {
        new CountUp('value', this.performance?.currentValueInBaseCurrency, {
          decimal: getNumberFormatDecimal(this.locale),
          decimalPlaces: this.precision,
          duration: 1,
          separator: getNumberFormatGroup(this.locale)
        }).start();
      } else if (this.showDetails === false) {
        new CountUp(
          'value',
          this.performance?.netPerformancePercentageWithCurrencyEffect * 100,
          {
            decimal: getNumberFormatDecimal(this.locale),
            decimalPlaces: 2,
            duration: 1,
            separator: getNumberFormatGroup(this.locale)
          }
        ).start();
      } else {
        this.value.nativeElement.innerHTML = '*****';
      }
    }
  }

  public onShowErrors() {
    const errorMessageParts = [];

    for (const error of this.errors) {
      errorMessageParts.push(`${error.symbol} (${error.dataSource})`);
    }

    this.notificationService.alert({
      message: errorMessageParts.join('<br />'),
      title: $localize`Market data is delayed for`
    });
  }
}
