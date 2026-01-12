import { Injectable } from '@angular/core';
import { AdminService } from '@ghostfolio/ui/services';
import { Platform } from '@prisma/client';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class AdminPlatformService {
  public constructor(private adminService: AdminService) {}

  public fetchPlatforms(): Observable<{
    dataSource: MatTableDataSource<Platform>;
    platforms: Platform[];
  }> {
    return this.adminService.fetchPlatforms().pipe(
      map((platforms) => ({
        dataSource: new MatTableDataSource(platforms),
        platforms
      }))
    );
  }

  public deletePlatform(id: string): Observable<any> {
    return this.adminService.deletePlatform(id);
  }

  public createPlatform(platform: any): Observable<any> {
    return this.adminService.postPlatform(platform);
  }

  public updatePlatform(id: string, platform: any): Observable<any> {
    return this.adminService.putPlatform(id, platform);
  }
}
