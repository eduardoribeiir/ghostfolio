import { NUMERICAL_PRECISION_THRESHOLD_6_FIGURES } from '@ghostfolio/common/config';
import { getDateFnsLocale, getLocale } from '@ghostfolio/common/helper';
import { PortfolioSummary, User } from '@ghostfolio/common/interfaces';
import { translate } from '@ghostfolio/ui/i18n';
import { NotificationService } from '@ghostfolio/ui/notifications';
import { GfValueComponent } from '@ghostfolio/ui/value';

import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output
} from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IonIcon } from '@ionic/angular/standalone';
import { formatDistanceToNow } from 'date-fns';
import { addIcons } from 'ionicons';
import {
  ellipsisHorizontalCircleOutline,
  informationCircleOutline
} from 'ionicons/icons';

import {
  PortfolioSummaryConfig,
  PortfolioSummaryData,
  PortfolioSummaryOptions
} from './interfaces/portfolio-summary-config.interface';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, GfValueComponent, IonIcon, MatTooltipModule],
  selector: 'gf-portfolio-summary',
  styleUrls: ['./portfolio-summary.component.scss'],
  templateUrl: './portfolio-summary.component.html'
})
export class GfPortfolioSummaryComponent implements OnChanges {
  @Input() config: PortfolioSummaryConfig;
  @Input() data: PortfolioSummaryData;
  @Input() options: PortfolioSummaryOptions;

  @Output() emergencyFundChanged = new EventEmitter<number>();

  public buyAndSellActivitiesTooltip = translate(
    'BUY_AND_SELL_ACTIVITIES_TOOLTIP'
  );

  public precision = 2;
  public timeInMarket: string;

  public get baseCurrency(): string {
    return this.config?.baseCurrency;
  }

  public get deviceType(): string {
    return this.config?.deviceType;
  }

  public get hasImpersonationId(): boolean {
    return this.options?.hasImpersonationId;
  }

  public get hasPermissionToUpdateUserSettings(): boolean {
    return this.options?.hasPermissionToUpdateUserSettings;
  }

  public get isLoading(): boolean {
    return this.options?.isLoading;
  }

  public get language(): string {
    return this.config?.language;
  }

  public get locale(): string {
    return this.config?.locale ?? getLocale();
  }

  public get summary(): PortfolioSummary {
    return this.data?.summary;
  }

  public get user(): User {
    return this.data?.user;
  }

  public get buyingPowerPercentage() {
    return this.summary?.totalValueInBaseCurrency
      ? this.summary.cash / this.summary.totalValueInBaseCurrency
      : 0;
  }

  public get emergencyFundPercentage() {
    return this.summary?.totalValueInBaseCurrency
      ? (this.summary.emergencyFund?.total || 0) /
          this.summary.totalValueInBaseCurrency
      : 0;
  }

  public get excludedFromAnalysisPercentage() {
    return this.summary?.totalValueInBaseCurrency
      ? this.summary.excludedAccountsAndActivities /
          this.summary.totalValueInBaseCurrency
      : 0;
  }

  public constructor(private notificationService: NotificationService) {
    addIcons({ ellipsisHorizontalCircleOutline, informationCircleOutline });
  }

  public ngOnChanges() {
    if (this.summary) {
      if (
        this.deviceType === 'mobile' &&
        this.summary.totalValueInBaseCurrency >=
          NUMERICAL_PRECISION_THRESHOLD_6_FIGURES
      ) {
        this.precision = 0;
      }

      if (this.summary.dateOfFirstActivity) {
        this.timeInMarket = formatDistanceToNow(
          this.summary.dateOfFirstActivity,
          {
            locale: getDateFnsLocale(this.language)
          }
        );
      } else {
        this.timeInMarket = '-';
      }
    } else {
      this.timeInMarket = undefined;
    }
  }

  public onEditEmergencyFund() {
    this.notificationService.prompt({
      confirmFn: (value) => {
        const emergencyFund = parseFloat(value.trim()) || 0;

        this.emergencyFundChanged.emit(emergencyFund);
      },
      confirmLabel: $localize`Save`,
      defaultValue: this.summary.emergencyFund?.total?.toString() ?? '0',
      title: $localize`Please set the amount of your emergency fund.`
    });
  }
}
