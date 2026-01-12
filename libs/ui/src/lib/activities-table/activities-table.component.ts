import {
  DEFAULT_PAGE_SIZE,
  TAG_ID_EXCLUDE_FROM_ANALYSIS
} from '@ghostfolio/common/config';
import { ConfirmationDialogType } from '@ghostfolio/common/enums';
import {
  Activity,
  AssetProfileIdentifier
} from '@ghostfolio/common/interfaces';
import { GfSymbolPipe } from '@ghostfolio/common/pipes';
import { OrderWithAccount } from '@ghostfolio/common/types';
import { NotificationService } from '@ghostfolio/ui/notifications';

import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent
} from '@angular/material/paginator';
import {
  MatSort,
  MatSortModule,
  Sort,
  SortDirection
} from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IonIcon } from '@ionic/angular/standalone';
import { isUUID } from 'class-validator';
import { endOfToday, isAfter } from 'date-fns';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  calendarClearOutline,
  cloudDownloadOutline,
  cloudUploadOutline,
  colorWandOutline,
  copyOutline,
  createOutline,
  documentTextOutline,
  ellipsisHorizontal,
  ellipsisVertical,
  tabletLandscapeOutline,
  trashOutline
} from 'ionicons/icons';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { Subject, Subscription, takeUntil } from 'rxjs';

import { GfActivityTypeComponent } from '../activity-type/activity-type.component';
import { GfEntityLogoComponent } from '../entity-logo/entity-logo.component';
import { GfNoTransactionsInfoComponent } from '../no-transactions-info/no-transactions-info.component';
import { GfValueComponent } from '../value/value.component';
import {
  ActivitiesTableConfig,
  ActivitiesTableData,
  ActivitiesTableOptions
} from './interfaces/activities-table-config.interface';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    GfActivityTypeComponent,
    GfEntityLogoComponent,
    GfNoTransactionsInfoComponent,
    GfSymbolPipe,
    GfValueComponent,
    IonIcon,
    MatButtonModule,
    MatCheckboxModule,
    MatMenuModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    MatTooltipModule,
    NgxSkeletonLoaderModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'gf-activities-table',
  styleUrls: ['./activities-table.component.scss'],
  templateUrl: './activities-table.component.html'
})
export class GfActivitiesTableComponent
  implements AfterViewInit, OnChanges, OnDestroy, OnInit
{
  @Input() config: ActivitiesTableConfig;
  @Input() data: ActivitiesTableData;
  @Input() options: ActivitiesTableOptions = {
    hasPermissionToCreateActivity: false,
    hasPermissionToDeleteActivity: false,
    hasPermissionToExportActivities: false,
    hasPermissionToFilter: false,
    hasPermissionToImportActivities: false,
    hasPermissionToOpenDetails: true,
    pageSize: DEFAULT_PAGE_SIZE,
    showActions: true,
    showCheckbox: false
  };
  @Input() deviceType: string;
  @Input() hasActivities: boolean;
  @Input() pageIndex: number;
  @Input() showAccountColumn = true;
  @Input() showNameColumn = true;
  @Input() sortColumn: string;
  @Input() sortDirection: SortDirection;
  @Input() sortDisabled = false;
  @Input() totalItems = Number.MAX_SAFE_INTEGER;

  @Output() activitiesDeleted = new EventEmitter<void>();
  @Output() activityClicked = new EventEmitter<AssetProfileIdentifier>();
  @Output() activityDeleted = new EventEmitter<string>();
  @Output() activityToClone = new EventEmitter<OrderWithAccount>();
  @Output() activityToUpdate = new EventEmitter<OrderWithAccount>();
  @Output() export = new EventEmitter<void>();
  @Output() exportDrafts = new EventEmitter<string[]>();
  @Output() import = new EventEmitter<void>();
  @Output() importDividends = new EventEmitter<AssetProfileIdentifier>();
  @Output() pageChanged = new EventEmitter<PageEvent>();
  @Output() selectedActivities = new EventEmitter<Activity[]>();
  @Output() sortChanged = new EventEmitter<Sort>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  public displayedColumns = [];
  public endOfToday = endOfToday();
  public hasDrafts = false;
  public hasErrors = false;
  public isAfter = isAfter;
  public isLoading = true;
  public isUUID = isUUID;
  public routeQueryParams: Subscription;
  public selectedRows = new SelectionModel<Activity>(true, []);

  private unsubscribeSubject = new Subject<void>();

  // Getters for template compatibility
  public get dataSource() {
    return this.data?.dataSource;
  }

  public get showActions() {
    return this.options.showActions ?? true;
  }

  public get hasPermissionToCreateActivity() {
    return this.options.hasPermissionToCreateActivity ?? false;
  }

  public get hasPermissionToDeleteActivity() {
    return this.options.hasPermissionToDeleteActivity ?? false;
  }

  public get hasPermissionToExportActivities() {
    return this.options.hasPermissionToExportActivities ?? false;
  }

  public get hasPermissionToFilter() {
    return this.options.hasPermissionToFilter ?? false;
  }

  public get hasPermissionToImportActivities() {
    return this.options.hasPermissionToImportActivities ?? false;
  }

  public get hasPermissionToOpenDetails() {
    return this.options.hasPermissionToOpenDetails ?? true;
  }

  public get showCheckbox() {
    return this.options.showCheckbox ?? false;
  }

  public get pageSize() {
    return this.options.pageSize ?? DEFAULT_PAGE_SIZE;
  }

  public get locale() {
    return this.config?.locale;
  }

  public constructor(private notificationService: NotificationService) {
    addIcons({
      alertCircleOutline,
      calendarClearOutline,
      cloudDownloadOutline,
      cloudUploadOutline,
      colorWandOutline,
      copyOutline,
      createOutline,
      documentTextOutline,
      ellipsisHorizontal,
      ellipsisVertical,
      tabletLandscapeOutline,
      trashOutline
    });
  }

  public ngOnInit() {
    if (this.showCheckbox) {
      this.toggleAllRows();
      this.selectedRows.changed
        .pipe(takeUntil(this.unsubscribeSubject))
        .subscribe((selectedRows) => {
          this.selectedActivities.emit(selectedRows.source.selected);
        });
    }
  }

  public ngAfterViewInit() {
    if (this.data?.dataSource) {
      this.data.dataSource.paginator = this.paginator;
    }

    this.sort.sortChange.subscribe((value: Sort) => {
      this.sortChanged.emit(value);
    });
  }

  public ngOnChanges() {
    this.displayedColumns = [
      'select',
      'importStatus',
      'icon',
      'nameWithSymbol',
      'type',
      'date',
      'quantity',
      'unitPrice',
      'fee',
      'value',
      'currency',
      'valueInBaseCurrency',
      'account',
      'comment',
      'actions'
    ];

    if (!this.showAccountColumn) {
      this.displayedColumns = this.displayedColumns.filter((column) => {
        return column !== 'account';
      });
    }

    if (!this.showCheckbox) {
      this.displayedColumns = this.displayedColumns.filter((column) => {
        return column !== 'importStatus' && column !== 'select';
      });
    }

    if (!this.showNameColumn) {
      this.displayedColumns = this.displayedColumns.filter((column) => {
        return column !== 'nameWithSymbol';
      });
    }

    if (this.data?.dataSource) {
      this.isLoading = false;
    }
  }

  public areAllRowsSelected() {
    const numSelectedRows = this.selectedRows.selected.length;
    const numTotalRows = this.data?.dataSource?.data?.length || 0;
    return numSelectedRows === numTotalRows;
  }

  public canClickActivity(activity: Activity) {
    return (
      this.hasPermissionToOpenDetails &&
      this.isExcludedFromAnalysis(activity) === false &&
      activity.isDraft === false &&
      ['BUY', 'DIVIDEND', 'SELL'].includes(activity.type)
    );
  }

  public isExcludedFromAnalysis(activity: Activity) {
    return (
      activity.account?.isExcluded ||
      activity.tags?.some(({ id }) => {
        return id === TAG_ID_EXCLUDE_FROM_ANALYSIS;
      })
    );
  }

  public onChangePage(page: PageEvent) {
    this.pageChanged.emit(page);
  }

  public onClickActivity(activity: Activity) {
    if (this.showCheckbox) {
      if (!activity.error) {
        this.selectedRows.toggle(activity);
      }
    } else if (this.canClickActivity(activity)) {
      this.activityClicked.emit({
        dataSource: activity.SymbolProfile.dataSource,
        symbol: activity.SymbolProfile.symbol
      });
    }
  }

  public onCloneActivity(aActivity: OrderWithAccount) {
    this.activityToClone.emit(aActivity);
  }

  public onDeleteActivities() {
    this.notificationService.confirm({
      confirmFn: () => {
        this.activitiesDeleted.emit();
      },
      confirmType: ConfirmationDialogType.Warn,
      title: $localize`Do you really want to delete these activities?`
    });
  }

  public onDeleteActivity(aId: string) {
    this.notificationService.confirm({
      confirmFn: () => {
        this.activityDeleted.emit(aId);
      },
      confirmType: ConfirmationDialogType.Warn,
      title: $localize`Do you really want to delete this activity?`
    });
  }

  public onExport() {
    this.export.emit();
  }

  public onExportDraft(aActivityId: string) {
    this.exportDrafts.emit([aActivityId]);
  }

  public onExportDrafts() {
    this.exportDrafts.emit(
      this.data.dataSource.filteredData
        .filter((activity) => {
          return activity.isDraft;
        })
        .map((activity) => {
          return activity.id;
        })
    );
  }

  public onImport() {
    this.import.emit();
  }

  public onImportDividends() {
    this.importDividends.emit();
  }

  public onOpenComment(aComment: string) {
    this.notificationService.alert({
      title: aComment
    });
  }

  public onUpdateActivity(aActivity: OrderWithAccount) {
    this.activityToUpdate.emit(aActivity);
  }

  public toggleAllRows() {
    if (this.areAllRowsSelected()) {
      this.selectedRows.clear();
    } else {
      this.data?.dataSource?.data?.forEach((row) => {
        this.selectedRows.select(row);
      });
    }

    this.selectedActivities.emit(this.selectedRows.selected);
  }

  public ngOnDestroy() {
    this.unsubscribeSubject.next();
    this.unsubscribeSubject.complete();
  }
}
