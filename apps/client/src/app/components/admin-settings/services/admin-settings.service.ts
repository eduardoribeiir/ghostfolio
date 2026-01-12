import { Injectable } from '@angular/core';
import { AdminService, DataService } from '@ghostfolio/ui/services';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataProviderInfo } from '@ghostfolio/common/interfaces';
import { MatTableDataSource } from '@angular/material/table';

@Injectable()
export class AdminSettingsService {
  public constructor(
    private adminService: AdminService,
    private dataService: DataService
  ) {}

  public fetchAdminData(): Observable<{
    dataSource: MatTableDataSource<DataProviderInfo>;
    dataProviders: DataProviderInfo[];
  }> {
    return this.adminService.fetchAdminData().pipe(
      map((data) => ({
        dataSource: new MatTableDataSource(data.dataProviders),
        dataProviders: data.dataProviders
      }))
    );
  }

  public deleteAssetProfileForDataProvider(dataSource: string): Observable<any> {
    return this.adminService.deleteAssetProfilesForDataSource({ dataSource });
  }

  public deleteGhostfolioApiKey(): Observable<any> {
    return this.dataService.deleteProperty('API_KEY_GHOSTFOLIO');
  }
}
