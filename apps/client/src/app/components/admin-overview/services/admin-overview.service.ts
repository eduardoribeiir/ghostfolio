import { Injectable } from '@angular/core';
import { AdminService, DataService } from '@ghostfolio/ui/services';
import { CacheService } from '@ghostfolio/client/services/cache.service';
import {
  Coupon,
  SystemMessage
} from '@ghostfolio/common/interfaces';
import {
  PROPERTY_COUPONS,
  PROPERTY_IS_DATA_GATHERING_ENABLED,
  PROPERTY_IS_READ_ONLY_MODE,
  PROPERTY_IS_USER_SIGNUP_ENABLED,
  PROPERTY_SYSTEM_MESSAGE,
  ghostfolioPrefix
} from '@ghostfolio/common/config';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StringValue } from 'ms';

export interface AdminOverviewData {
  coupons: Coupon[];
  isDataGatheringEnabled: boolean;
  systemMessage: SystemMessage;
  transactionCount: number;
  userCount: number;
  version: string;
}

/**
 * Service responsible for admin overview operations
 * Extracted from admin-overview component to reduce complexity
 */
@Injectable()
export class AdminOverviewService {
  public constructor(
    private adminService: AdminService,
    private cacheService: CacheService,
    private dataService: DataService
  ) {}

  public fetchAdminData(): Observable<AdminOverviewData> {
    return this.adminService.fetchAdminData().pipe(
      map(({ settings, transactionCount, userCount, version }) => ({
        coupons: (settings[PROPERTY_COUPONS] as Coupon[]) ?? [],
        isDataGatheringEnabled:
          settings[PROPERTY_IS_DATA_GATHERING_ENABLED] === false ? false : true,
        systemMessage: settings[PROPERTY_SYSTEM_MESSAGE] as SystemMessage,
        transactionCount,
        userCount,
        version
      }))
    );
  }

  public generateCouponCode(length: number = 14): string {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ123456789';
    let couponCode = '';

    for (let i = 0; i < length; i++) {
      couponCode += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }

    return `${ghostfolioPrefix}${couponCode}`;
  }

  public addCoupon(
    currentCoupons: Coupon[],
    duration: StringValue
  ): Observable<any> {
    const coupons = [
      ...currentCoupons,
      {
        code: this.generateCouponCode(),
        duration
      }
    ];
    return this.updateSetting(PROPERTY_COUPONS, coupons);
  }

  public deleteCoupon(
    currentCoupons: Coupon[],
    couponCode: string
  ): Observable<any> {
    const coupons = currentCoupons.filter((coupon) => coupon.code !== couponCode);
    return this.updateSetting(PROPERTY_COUPONS, coupons);
  }

  public setSystemMessage(message: SystemMessage): Observable<any> {
    return this.updateSetting(PROPERTY_SYSTEM_MESSAGE, message);
  }

  public deleteSystemMessage(): Observable<any> {
    return this.updateSetting(PROPERTY_SYSTEM_MESSAGE, undefined);
  }

  public setDataGatheringEnabled(enabled: boolean): Observable<any> {
    return this.updateSetting(
      PROPERTY_IS_DATA_GATHERING_ENABLED,
      enabled ? undefined : false
    );
  }

  public setUserSignupEnabled(enabled: boolean): Observable<any> {
    return this.updateSetting(
      PROPERTY_IS_USER_SIGNUP_ENABLED,
      enabled ? undefined : false
    );
  }

  public setReadOnlyMode(enabled: boolean): Observable<any> {
    return this.updateSetting(
      PROPERTY_IS_READ_ONLY_MODE,
      enabled ? true : undefined
    );
  }

  public flushCache(): Observable<any> {
    return this.cacheService.flush();
  }

  public syncDemoUserAccount(): Observable<any> {
    return this.adminService.syncDemoUserAccount();
  }

  private updateSetting(key: string, value: any): Observable<any> {
    return this.dataService.putAdminSetting(key, {
      value: value || value === false ? JSON.stringify(value) : undefined
    });
  }
}
