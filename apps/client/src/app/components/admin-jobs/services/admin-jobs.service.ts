import { Injectable } from '@angular/core';
import { AdminService } from '@ghostfolio/ui/services';
import { JobStatus } from 'bull';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AdminJobs } from '@ghostfolio/common/interfaces';
import { MatTableDataSource } from '@angular/material/table';

@Injectable()
export class AdminJobsService {
  public constructor(private adminService: AdminService) {}

  public fetchJobs(status?: JobStatus[]): Observable<{
    dataSource: MatTableDataSource<AdminJobs['jobs'][0]>;
    jobs: AdminJobs['jobs'];
  }> {
    return this.adminService.fetchJobs({ status }).pipe(
      map((response) => ({
        dataSource: new MatTableDataSource(response.jobs),
        jobs: response.jobs
      }))
    );
  }

  public deleteJob(id: string): Observable<any> {
    return this.adminService.deleteJob(id);
  }

  public deleteJobs(status: JobStatus[]): Observable<any> {
    return this.adminService.deleteJobs({ status });
  }
}
