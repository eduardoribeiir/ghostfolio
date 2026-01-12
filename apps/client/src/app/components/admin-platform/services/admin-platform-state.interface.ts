import { MatTableDataSource } from '@angular/material/table';
import { Platform } from '@prisma/client';

export interface AdminPlatformState {
  dataSource: MatTableDataSource<Platform>;
  platforms: Platform[];
}
