import { UserService } from '@ghostfolio/client/services/user/user.service';
import { ASSET_CLASS_MAPPING, PROPERTY_IS_DATA_GATHERING_ENABLED } from '@ghostfolio/common/config';
import { UpdateAssetProfileDto } from '@ghostfolio/common/dtos';
import { AssetClassSelectorOption, AssetProfileIdentifier, LineChartItem, ScraperConfiguration, User, AdminMarketDataDetails } from '@ghostfolio/common/interfaces';
import { DateRange } from '@ghostfolio/common/types';
import { NotificationService } from '@ghostfolio/ui/notifications';
import { AdminService, DataService } from '@ghostfolio/ui/services';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AssetClass, AssetSubClass, MarketData, SymbolProfile } from '@prisma/client';
import { EMPTY, Observable, Subject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import ms from 'ms';
import { ConfirmationDialogType } from '@ghostfolio/common/enums';

@Injectable()
export class AssetProfileDialogService {
  constructor(
    private adminService: AdminService,
    private dataService: DataService,
    private notificationService: NotificationService,
    private snackBar: MatSnackBar,
    private userService: UserService
  ) {}

  public initialize(params: { dataSource: string; symbol: string; unsubscribeSubject: Subject<void>; }, callbacks: { onDataGatheringEnabledChange: (enabled: boolean) => void; onUserChange: (user: User) => void; onAssetClassChange: (assetSubClassOptions: AssetClassSelectorOption[]) => void; onHistoricalDataChange: (items: LineChartItem[]) => void; }): void {
    this.adminService.fetchAdminData().pipe(takeUntil(params.unsubscribeSubject)).subscribe(({ settings }) => {
      callbacks.onDataGatheringEnabledChange(settings[PROPERTY_IS_DATA_GATHERING_ENABLED] === false ? false : true);
    });
    this.userService.stateChanged.pipe(takeUntil(params.unsubscribeSubject)).subscribe((state) => {
      if (state?.user) callbacks.onUserChange(state.user);
    });
  }

  public handleAssetClassChange(assetClass: AssetClass, currentSubClass: AssetSubClass, callback: (subClassOptions: AssetClassSelectorOption[], shouldResetSubClass: boolean) => void): void {
    const assetSubClasses = ASSET_CLASS_MAPPING.get(assetClass) ?? [];
    const assetSubClassOptions = assetSubClasses.map((id) => ({ id, label: id })).sort((a, b) => a.label.localeCompare(b.label));
    const shouldResetSubClass = !assetSubClasses.includes(currentSubClass);
    callback(assetSubClassOptions, shouldResetSubClass);
  }

  public handleCurrencyChange(currency: string, marketData: MarketData[], callback: (filteredMarketData: MarketData[]) => void): void {
    const filteredMarketData = marketData.filter((item) => item.date.getFullYear() >= new Date().getFullYear() - 10 && (!currency || item.symbol === currency));
    callback(filteredMarketData);
  }

  public fetchAssetProfile(identifier: AssetProfileIdentifier, unsubscribeSubject: Subject<void>, callback: (profile: AdminMarketDataDetails) => void): void {
    this.adminService.fetchAdminMarketDataBySymbol(identifier).pipe(takeUntil(unsubscribeSubject)).subscribe((profile) => callback(profile));
  }

  public fetchChartData(params: { dataSource: string; symbol: string; range: DateRange; unsubscribeSubject: Subject<void>; }, callback: (items: LineChartItem[]) => void): void {
    this.adminService.fetchChart({ dataSource: params.dataSource, symbol: params.symbol, range: params.range }).pipe(takeUntil(params.unsubscribeSubject)).subscribe((items) => callback(items));
  }

  public handleDeleteProfileData(identifier: AssetProfileIdentifier): void {
    this.notificationService.confirm({ confirmFn: () => this.adminService.deleteProfileData(identifier).subscribe(() => { setTimeout(() => window.location.reload(), 300); }), confirmType: ConfirmationDialogType.Warn, title: $localize`Do you really want to delete this asset profile?` });
  }

  public handleGatherProfileDataBySymbol(identifier: AssetProfileIdentifier, unsubscribeSubject: Subject<void>, callback: (profile: AdminMarketDataDetails) => void): void {
    this.adminService.gatherProfileDataBySymbol(identifier).pipe(takeUntil(unsubscribeSubject)).subscribe(() => {
      setTimeout(() => {
        this.fetchAssetProfile(identifier, unsubscribeSubject, callback);
        this.snackBar.open($localize`Data has been gathered successfully`, undefined, { duration: ms('5 seconds') });
      }, ms('1 seconds'));
    });
  }

  public handleGatherSymbol(identifier: AssetProfileIdentifier, unsubscribeSubject: Subject<void>, callback: () => void): void {
    this.adminService.gatherSymbol(identifier).pipe(takeUntil(unsubscribeSubject)).subscribe(() => {
      setTimeout(() => {
        callback();
        this.snackBar.open($localize`Data has been gathered successfully`, undefined, { duration: ms('5 seconds') });
      }, ms('1 seconds'));
    });
  }

  public handleSetBenchmark(identifier: AssetProfileIdentifier, unsubscribeSubject: Subject<void>, callback: (benchmarks: Partial<SymbolProfile>[]) => void): void {
    this.dataService.putAdminSetting({ key: 'BENCHMARKS', value: [identifier] }).pipe(takeUntil(unsubscribeSubject)).subscribe(() => {
      this.userService.remove();
      const { benchmarks } = this.dataService.fetchInfo();
      callback(benchmarks);
    });
  }

  public handleUnsetBenchmark(identifier: AssetProfileIdentifier, benchmarks: Partial<SymbolProfile>[], unsubscribeSubject: Subject<void>, callback: (benchmarks: Partial<SymbolProfile>[]) => void): void {
    const updatedBenchmarks = benchmarks.filter(({ dataSource, symbol }) => dataSource !== identifier.dataSource || symbol !== identifier.symbol);
    this.dataService.putAdminSetting({ key: 'BENCHMARKS', value: updatedBenchmarks }).pipe(takeUntil(unsubscribeSubject)).subscribe(() => {
      this.userService.remove();
      const { benchmarks: newBenchmarks } = this.dataService.fetchInfo();
      callback(newBenchmarks);
    });
  }

  public handleTestMarketData(scraperConfiguration: ScraperConfiguration, unsubscribeSubject: Subject<void>, callback: (result: any, error?: any) => void): void {
    this.adminService.testMarketData(scraperConfiguration).pipe(catchError((error) => { callback(null, error); return EMPTY; }), takeUntil(unsubscribeSubject)).subscribe((result) => callback(result));
  }

  public handleToggleIsActive(identifier: AssetProfileIdentifier, checked: boolean, unsubscribeSubject: Subject<void>, callback: () => void): void {
    this.adminService.patchAssetProfile({ ...identifier, isActive: checked }).pipe(takeUntil(unsubscribeSubject)).subscribe(() => callback());
  }

  public submitAssetProfile(identifier: AssetProfileIdentifier, assetProfile: UpdateAssetProfileDto, unsubscribeSubject: Subject<void>, callback: (success: boolean, error?: any) => void): void {
    this.adminService.patchAssetProfile({ ...identifier, ...assetProfile }).pipe(catchError((error) => { callback(false, error); return EMPTY; }), takeUntil(unsubscribeSubject)).subscribe(() => callback(true));
  }

  public updateAssetProfileIdentifier(oldIdentifier: AssetProfileIdentifier, newIdentifier: AssetProfileIdentifier, unsubscribeSubject: Subject<void>, callback: (success: boolean, newId?: AssetProfileIdentifier) => void): void {
    this.adminService.patchAssetProfileIdentifier({ oldDataSource: oldIdentifier.dataSource, oldSymbol: oldIdentifier.symbol, newDataSource: newIdentifier.dataSource, newSymbol: newIdentifier.symbol }).pipe(catchError(() => { callback(false); return EMPTY; }), takeUntil(unsubscribeSubject)).subscribe(() => callback(true, newIdentifier));
  }
}
