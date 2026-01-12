import { Injectable } from '@angular/core';
import { AssetProfileIdentifier } from '@ghostfolio/common/interfaces';
import { AdminService } from '@ghostfolio/ui/services';
import { Observable } from 'rxjs';

/**
 * Service responsible for data operations in Admin Market Data
 */
@Injectable()
export class AdminMarketDataOperationsService {
  public constructor(private adminService: AdminService) {}

  /**
   * Gather historical data for the last 7 days
   */
  public gather7Days(): Observable<void> {
    return this.adminService.gather7Days();
  }

  /**
   * Gather maximum available historical data
   */
  public gatherMax(): Observable<void> {
    return this.adminService.gatherMax();
  }

  /**
   * Gather profile data for all symbols
   */
  public gatherProfileData(): Observable<void> {
    return this.adminService.gatherProfileData();
  }

  /**
   * Gather profile data for a specific symbol
   */
  public gatherProfileDataBySymbol(
    identifier: AssetProfileIdentifier
  ): Observable<void> {
    return this.adminService.gatherProfileDataBySymbol(identifier);
  }

  /**
   * Gather market data for a specific symbol
   */
  public gatherSymbol(identifier: AssetProfileIdentifier): Observable<void> {
    return this.adminService.gatherSymbol(identifier);
  }

  /**
   * Add a new asset profile
   */
  public addAssetProfile(identifier: AssetProfileIdentifier): Observable<void> {
    return this.adminService.addAssetProfile(identifier);
  }
}
