import { CacheService } from '@ghostfolio/client/services/cache.service';
import { UserService } from '@ghostfolio/client/services/user/user.service';
import {
  PROPERTY_COUPONS,
  PROPERTY_IS_DATA_GATHERING_ENABLED,
  PROPERTY_IS_READ_ONLY_MODE,
  PROPERTY_IS_USER_SIGNUP_ENABLED,
  PROPERTY_SYSTEM_MESSAGE,
  ghostfolioPrefix
} from '@ghostfolio/common/config';
import { ConfirmationDialogType } from '@ghostfolio/common/enums';
import { getDateFnsLocale } from '@ghostfolio/common/helper';
import {
  Coupon,
  InfoItem,
  SystemMessage,
  User
} from '@ghostfolio/common/interfaces';
import { hasPermission, permissions } from '@ghostfolio/common/permissions';
import { NotificationService } from '@ghostfolio/ui/notifications';
import { AdminService, DataService } from '@ghostfolio/ui/services';
import { GfValueComponent } from '@ghostfolio/ui/value';

import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import {
  MatSlideToggleChange,
  MatSlideToggleModule
} from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import {
  addMilliseconds,
  differenceInSeconds,
  formatDistanceToNowStrict,
  parseISO
} from 'date-fns';
import { addIcons } from 'ionicons';
import {
  closeCircleOutline,
  ellipsisHorizontal,
  informationCircleOutline,
  syncOutline,
  trashOutline
} from 'ionicons/icons';
import ms, { StringValue } from 'ms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AdminOverviewService } from './services/admin-overview.service';

@Component({
  imports: [
    CommonModule,
    FormsModule,
    GfValueComponent,
    IonIcon,
    MatButtonModule,
    MatCardModule,
    MatMenuModule,
    MatSelectModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    RouterModule
  ],
  providers: [AdminOverviewService],
  selector: 'gf-admin-overview',
  styleUrls: ['./admin-overview.scss'],
  templateUrl: './admin-overview.html'
})
export class GfAdminOverviewComponent implements OnDestroy, OnInit {
  public couponDuration: StringValue = '14 days';
  public coupons: Coupon[];
  public hasPermissionForSubscription: boolean;
  public hasPermissionForSystemMessage: boolean;
  public hasPermissionToSyncDemoUserAccount: boolean;
  public hasPermissionToToggleReadOnlyMode: boolean;
  public info: InfoItem;
  public isDataGatheringEnabled: boolean;
  public permissions = permissions;
  public systemMessage: SystemMessage;
  public transactionCount: number;
  public userCount: number;
  public user: User;
  public version: string;

  private unsubscribeSubject = new Subject<void>();

  public constructor(
    private adminOverviewService: AdminOverviewService,
    private changeDetectorRef: ChangeDetectorRef,
    private dataService: DataService,
    private notificationService: NotificationService,
    private snackBar: MatSnackBar,
    private userService: UserService
  ) {
    this.info = this.dataService.fetchInfo();

    this.userService.stateChanged
      .pipe(takeUntil(this.unsubscribeSubject))
      .subscribe((state) => {
        if (state?.user) {
          this.user = state.user;

          this.hasPermissionForSubscription = hasPermission(
            this.info.globalPermissions,
            permissions.enableSubscription
          );

          this.hasPermissionForSystemMessage = hasPermission(
            this.info.globalPermissions,
            permissions.enableSystemMessage
          );

          this.hasPermissionToSyncDemoUserAccount = hasPermission(
            this.user.permissions,
            permissions.syncDemoUserAccount
          );

          this.hasPermissionToToggleReadOnlyMode = hasPermission(
            this.user.permissions,
            permissions.toggleReadOnlyMode
          );
        }
      });

    addIcons({
      closeCircleOutline,
      ellipsisHorizontal,
      informationCircleOutline,
      syncOutline,
      trashOutline
    });
  }

  public ngOnInit() {
    this.fetchAdminData();
  }

  public formatDistanceToNow(aDateString: string) {
    if (aDateString) {
      const distanceString = formatDistanceToNowStrict(parseISO(aDateString), {
        addSuffix: true
      });

      return Math.abs(differenceInSeconds(parseISO(aDateString), new Date())) <
        60
        ? 'just now'
        : distanceString;
    }

    return '';
  }

  public formatStringValue(aStringValue: StringValue) {
    return formatDistanceToNowStrict(
      addMilliseconds(new Date(), ms(aStringValue)),
      {
        locale: getDateFnsLocale(this.user?.settings?.language)
      }
    );
  }

  public onAddCoupon() {
    this.adminOverviewService
      .addCoupon(this.coupons, this.couponDuration)
      .pipe(takeUntil(this.unsubscribeSubject))
      .subscribe(() => {
        setTimeout(() => window.location.reload(), 300);
      });
  }

  public onChangeCouponDuration(aCouponDuration: StringValue) {
    this.couponDuration = aCouponDuration;
  }

  public onDeleteCoupon(aCouponCode: string) {
    this.notificationService.confirm({
      confirmFn: () => {
        this.adminOverviewService
          .deleteCoupon(this.coupons, aCouponCode)
          .pipe(takeUntil(this.unsubscribeSubject))
          .subscribe(() => {
            setTimeout(() => window.location.reload(), 300);
          });
      },
      confirmType: ConfirmationDialogType.Warn,
      title: $localize`Do you really want to delete this coupon?`
    });
  }

  public onDeleteSystemMessage() {
    this.notificationService.confirm({
      confirmFn: () => {
        this.adminOverviewService
          .deleteSystemMessage()
          .pipe(takeUntil(this.unsubscribeSubject))
          .subscribe(() => {
            setTimeout(() => window.location.reload(), 300);
          });
      },
      confirmType: ConfirmationDialogType.Warn,
      title: $localize`Do you really want to delete this system message?`
    });
  }

  public onEnableDataGatheringChange(aEvent: MatSlideToggleChange) {
    this.adminOverviewService
      .setDataGatheringEnabled(aEvent.checked)
      .pipe(takeUntil(this.unsubscribeSubject))
      .subscribe(() => {
        setTimeout(() => window.location.reload(), 300);
      });
  }

  public onFlushCache() {
    this.notificationService.confirm({
      confirmFn: () => {
        this.adminOverviewService
          .flushCache()
          .pipe(takeUntil(this.unsubscribeSubject))
          .subscribe(() => {
            setTimeout(() => window.location.reload(), 300);
          });
      },
      confirmType: ConfirmationDialogType.Warn,
      title: $localize`Do you really want to flush the cache?`
    });
  }

  public onEnableUserSignupModeChange(aEvent: MatSlideToggleChange) {
    this.adminOverviewService
      .setUserSignupEnabled(aEvent.checked)
      .pipe(takeUntil(this.unsubscribeSubject))
      .subscribe(() => {
        setTimeout(() => window.location.reload(), 300);
      });
  }

  public onReadOnlyModeChange(aEvent: MatSlideToggleChange) {
    this.adminOverviewService
      .setReadOnlyMode(aEvent.checked)
      .pipe(takeUntil(this.unsubscribeSubject))
      .subscribe(() => {
        setTimeout(() => window.location.reload(), 300);
      });
  }

  public onSetSystemMessage() {
    const systemMessage = prompt(
      $localize`Please set your system message:`,
      JSON.stringify(
        this.systemMessage ??
          ({
            message: '⚒️ Scheduled maintenance in progress...',
            targetGroups: ['Basic', 'Premium']
          } as SystemMessage)
      )
    );

    if (systemMessage) {
      this.adminOverviewService
        .setSystemMessage(JSON.parse(systemMessage))
        .pipe(takeUntil(this.unsubscribeSubject))
        .subscribe(() => {
          setTimeout(() => window.location.reload(), 300);
        });
    }
  }

  public onSyncDemoUserAccount() {
    this.adminOverviewService
      .syncDemoUserAccount()
      .pipe(takeUntil(this.unsubscribeSubject))
      .subscribe(() => {
        this.snackBar.open(
          '✅ ' + $localize`Demo user account has been synced.`,
          undefined,
          {
            duration: ms('3 seconds')
          }
        );
      });
  }

  public ngOnDestroy() {
    this.unsubscribeSubject.next();
    this.unsubscribeSubject.complete();
  }

  private fetchAdminData() {
    this.adminOverviewService
      .fetchAdminData()
      .pipe(takeUntil(this.unsubscribeSubject))
      .subscribe((data) => {
        this.coupons = data.coupons;
        this.isDataGatheringEnabled = data.isDataGatheringEnabled;
        this.systemMessage = data.systemMessage;
        this.transactionCount = data.transactionCount;
        this.userCount = data.userCount;
        this.version = data.version;

        this.changeDetectorRef.markForCheck();
      });
  }
}
