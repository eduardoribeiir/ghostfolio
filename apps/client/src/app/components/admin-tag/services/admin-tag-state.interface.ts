import { MatTableDataSource } from '@angular/material/table';
import { Tag } from '@prisma/client';

export interface AdminTagState {
  dataSource: MatTableDataSource<Tag>;
  tags: Tag[];
}
