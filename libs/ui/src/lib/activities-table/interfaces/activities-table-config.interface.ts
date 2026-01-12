import { Activity } from '@ghostfolio/common/interfaces';
import { MatTableDataSource } from '@angular/material/table';

export interface ActivitiesTableConfig {
  baseCurrency: string;
  locale: string;
}

export interface ActivitiesTableData {
  dataSource: MatTableDataSource<Activity>;
}

export interface ActivitiesTableOptions {
  hasPermissionToCreateActivity: boolean;
  hasPermissionToDeleteActivity: boolean;
  hasPermissionToExportActivities: boolean;
  hasPermissionToFilter: boolean;
  hasPermissionToImportActivities: boolean;
  hasPermissionToOpenDetails: boolean;
  pageSize: number;
  showActions: boolean;
  showCheckbox: boolean;
}
