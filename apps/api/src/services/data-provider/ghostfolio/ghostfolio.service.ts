import { Injectable } from '@nestjs/common';
import {
  DataProviderInterface,
  GetAssetProfileParams,
  GetDividendsParams,
  GetHistoricalParams,
  GetQuotesParams,
  GetSearchParams
} from '@ghostfolio/api/services/data-provider/interfaces/data-provider.interface';
import { DataSource, SymbolProfile } from '@prisma/client';
import {
  DataProviderGhostfolioAssetProfileResponse,
  DataProviderHistoricalResponse,
  DataProviderInfo,
  DataProviderResponse,
  LookupResponse
} from '@ghostfolio/common/interfaces';
import { GhostfolioApiService } from './ghostfolio-api.service';
import { GhostfolioRequestService } from './ghostfolio-request.service';
import { format } from 'date-fns';
import { DATE_FORMAT } from '@ghostfolio/common/helper';

@Injectable()
export class GhostfolioService implements DataProviderInterface {
  public constructor(
    private readonly apiService: GhostfolioApiService,
    private readonly requestService: GhostfolioRequestService
  ) {}

  public canHandle(): boolean {
    return true;
  }

  public async getAssetProfile({
    requestTimeout,
    symbol
  }: GetAssetProfileParams): Promise<Partial<SymbolProfile>> {
    return await this.apiService.fetchAssetProfile(symbol, requestTimeout);
  }

  public getDataProviderInfo(): DataProviderInfo {
    return {
      dataSource: DataSource.GHOSTFOLIO,
      isPremium: true,
      name: 'Ghostfolio',
      url: 'https://ghostfol.io'
    };
  }

  public async getDividends({
    from,
    granularity = 'day',
    requestTimeout,
    symbol,
    to
  }: GetDividendsParams): Promise<{
    [date: string]: DataProviderHistoricalResponse;
  }> {
    return await this.apiService.fetchDividends(
      symbol,
      from,
      to,
      granularity,
      requestTimeout
    );
  }

  public async getHistorical({
    from,
    granularity = 'day',
    requestTimeout,
    symbol,
    to
  }: GetHistoricalParams): Promise<{
    [symbol: string]: { [date: string]: DataProviderHistoricalResponse };
  }> {
    return await this.apiService.fetchHistorical(
      symbol,
      from,
      to,
      granularity,
      requestTimeout
    );
  }

  public getMaxNumberOfSymbolsPerRequest(): number {
    return 20;
  }

  public getName(): DataSource {
    return DataSource.GHOSTFOLIO;
  }

  public async getQuotes({
    requestTimeout,
    symbols
  }: GetQuotesParams): Promise<{
    [symbol: string]: DataProviderResponse;
  }> {
    return await this.apiService.fetchQuotes(symbols, requestTimeout);
  }

  public getTestSymbol(): string {
    return 'AAPL';
  }

  public async search({
    query,
    requestTimeout
  }: GetSearchParams): Promise<LookupResponse> {
    const result = await this.apiService.fetchSearch(query, requestTimeout);
    return result as LookupResponse;
  }
}