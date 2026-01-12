import { getLocale } from '@ghostfolio/common/helper';

import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges
} from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { isNumber } from 'lodash';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

import {
  ValueComponentConfig,
  ValueComponentData,
  ValueComponentOptions
} from './interfaces/value-config.interface';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonIcon, NgxSkeletonLoaderModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'gf-value',
  styleUrls: ['./value.component.scss'],
  templateUrl: './value.component.html'
})
export class GfValueComponent implements OnChanges {
  @Input() config: ValueComponentConfig;
  @Input() data: ValueComponentData = {
    icon: '',
    position: '',
    subLabel: '',
    unit: '',
    value: ''
  };
  @Input() options: ValueComponentOptions = {
    colorizeSign: false,
    isAbsolute: false,
    isCurrency: false,
    isDate: false,
    isPercent: false
  };

  public absoluteValue = 0;
  public formattedValue = '';
  public isNumber = false;
  public isString = false;
  public useAbsoluteValue = false;

  private _locale: string;
  private _precision: number;

  public get colorizeSign(): boolean {
    return this.options?.colorizeSign ?? false;
  }

  public get deviceType(): string {
    return this.config?.deviceType;
  }

  public get icon(): string {
    return this.data?.icon ?? '';
  }

  public get isAbsolute(): boolean {
    return this.options?.isAbsolute ?? false;
  }

  public get isCurrency(): boolean {
    return this.options?.isCurrency ?? false;
  }

  public get isDate(): boolean {
    return this.options?.isDate ?? false;
  }

  public get isPercent(): boolean {
    return this.options?.isPercent ?? false;
  }

  public get locale(): string {
    return this._locale ?? this.config?.locale;
  }

  public get position(): string {
    return this.data?.position ?? '';
  }

  public get precision(): number {
    return this._precision ?? this.config?.precision;
  }

  public get size(): 'large' | 'medium' | 'small' {
    return this.config?.size ?? 'small';
  }

  public get subLabel(): string {
    return this.data?.subLabel ?? '';
  }

  public get unit(): string {
    return this.data?.unit ?? '';
  }

  public get value(): number | string {
    return this.data?.value ?? '';
  }

  public ngOnChanges() {
    this.initializeVariables();

    if (this.value || this.value === 0) {
      if (isNumber(this.value)) {
        this.isNumber = true;
        this.isString = false;
        this.absoluteValue = Math.abs(this.value);

        if (this.colorizeSign) {
          if (this.isCurrency) {
            try {
              this.formattedValue = this.absoluteValue.toLocaleString(
                this.locale,
                {
                  maximumFractionDigits:
                    this.precision >= 0 ? this.precision : 2,
                  minimumFractionDigits:
                    this.precision >= 0 ? this.precision : 2
                }
              );
            } catch {}
          } else if (this.isPercent) {
            try {
              this.formattedValue = (this.absoluteValue * 100).toLocaleString(
                this.locale,
                {
                  maximumFractionDigits:
                    this.precision >= 0 ? this.precision : 2,
                  minimumFractionDigits:
                    this.precision >= 0 ? this.precision : 2
                }
              );
            } catch {}
          }
        } else if (this.isCurrency) {
          try {
            this.formattedValue = this.value?.toLocaleString(this.locale, {
              maximumFractionDigits: this.precision >= 0 ? this.precision : 2,
              minimumFractionDigits: this.precision >= 0 ? this.precision : 2
            });
          } catch {}
        } else if (this.isPercent) {
          try {
            this.formattedValue = (this.value * 100).toLocaleString(
              this.locale,
              {
                maximumFractionDigits: this.precision >= 0 ? this.precision : 2,
                minimumFractionDigits: this.precision >= 0 ? this.precision : 2
              }
            );
          } catch {}
        } else if (this.precision >= 0) {
          try {
            this.formattedValue = this.value?.toLocaleString(this.locale, {
              maximumFractionDigits: this.precision,
              minimumFractionDigits: this.precision
            });
          } catch {}
        } else {
          this.formattedValue = this.value?.toLocaleString(this.locale);
        }

        if (this.isAbsolute) {
          // Remove algebraic sign
          this.formattedValue = this.formattedValue.replace(/^-/, '');
        }
      } else {
        this.isNumber = false;
        this.isString = true;

        if (this.isDate) {
          this.formattedValue = new Date(this.value).toLocaleDateString(
            this.locale,
            {
              day: '2-digit',
              month: '2-digit',
              year: this.deviceType === 'mobile' ? '2-digit' : 'numeric'
            }
          );
        } else {
          this.formattedValue = this.value;
        }
      }
    }

    if (this.formattedValue === '0.00') {
      this.useAbsoluteValue = true;
    }
  }

  private initializeVariables() {
    this.absoluteValue = 0;
    this.formattedValue = '';
    this.isNumber = false;
    this.isString = false;
    this._locale = this.config?.locale || getLocale();
    this._precision = this.config?.precision >= 0 ? this.config?.precision : undefined;
    this.useAbsoluteValue = false;
  }
}
