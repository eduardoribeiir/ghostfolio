import { Injectable } from '@angular/core';
import { DataService } from '@ghostfolio/ui/services';
import { Tag } from '@prisma/client';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class AdminTagService {
  public constructor(private dataService: DataService) {}

  public fetchTags(): Observable<{
    dataSource: MatTableDataSource<Tag>;
    tags: Tag[];
  }> {
    return this.dataService.fetchTags().pipe(
      map((tags) => ({
        dataSource: new MatTableDataSource(tags),
        tags
      }))
    );
  }

  public deleteTag(id: string): Observable<any> {
    return this.dataService.deleteTag(id);
  }

  public createTag(tag: any): Observable<any> {
    return this.dataService.postTag(tag);
  }

  public updateTag(id: string, tag: any): Observable<any> {
    return this.dataService.putTag({ id, ...tag });
  }
}
