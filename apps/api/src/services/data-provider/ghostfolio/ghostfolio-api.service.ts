import { Injectable } from '@nestjs/common';
import { GhostfolioRequestService } from './ghostfolio-request.service';
import { GhostfolioErrorService } from './ghostfolio-error.service';
import { DataProviderGhostfolioAssetProfileResponse } from '@ghostfolio/common/interfaces';
import { DATE_FORMAT } from '@ghostfolio/common/helper';
import { format } from 'date-fns';

@Injectable()
export class GhostfolioApiService {
  public constructor(
    private readonly requestService: GhostfolioRequestService,
    private readonly errorService: GhostfolioErrorService
  ) {}

  public async fetchAssetProfile(
    symbol: string,
    requestTimeout?: number
  ): Promise<DataProviderGhostfolioAssetProfileResponse | undefined> {
    try {
      const response = await fetch(
        this.requestService.getUrl(`v1/data-providers/ghostfolio/asset-profile/${symbol}`),
        {
          headers: await this.requestService.getRequestHeaders(),
          signal: this.requestService.createAbortSignal(requestTimeout)
        }
      );

      if (!response.ok) {
        throw new Response(await response.text(), {
          status: response.status,
          statusText: response.statusText
        });
      }

      return await response.json() as DataProviderGhostfolioAssetProfileResponse;
    } catch (error) {
      this.errorService.handleAssetProfileError(error, symbol, requestTimeout || this.requestService.getConfig().requestTimeout);
      return undefined;
    }
  }

  public async fetchQuotes(
    symbols: string[],
    requestTimeout?: number
  ): Promise<{ [symbol: string]: any }> {
    if (symbols.length <= 0) {
      return {};
    }

    try {
      const queryParams = new URLSearchParams({
        symbols: symbols.join(',')
      });

      const response = await fetch(
        this.requestService.getUrl(`v2/data-providers/ghostfolio/quotes?${queryParams.toString()}`),
        {
          headers: await this.requestService.getRequestHeaders(),
          signal: this.requestService.createAbortSignal(requestTimeout)
        }
      );

      if (!response.ok) {
        throw new Response(await response.text(), {
          status: response.status,
          statusText: response.statusText
        });
      }

      const data = await response.json();
      return data.quotes;
    } catch (error) {
      this.errorService.handleQuotesError(error, symbols, requestTimeout || this.requestService.getConfig().requestTimeout);
      return {};
    }
  }

  public async fetchSearch(
    query: string,
    requestTimeout?: number
  ): Promise<{ items: any[] }> {
    try {
      const queryParams = new URLSearchParams({ query });

      const response = await fetch(
        this.requestService.getUrl(`v2/data-providers/ghostfolio/lookup?${queryParams.toString()}`),
        {
          headers: await this.requestService.getRequestHeaders(),
          signal: this.requestService.createAbortSignal(requestTimeout)
        }
      );

      if (!response.ok) {
        throw new Response(await response.text(), {
          status: response.status,
          statusText: response.statusText
        });
      }

      return await response.json();
    } catch (error) {
      this.errorService.handleSearchError(error, query, requestTimeout || this.requestService.getConfig().requestTimeout);
      return { items: [] };
    }
  }

  public async fetchDividends(
    symbol: string,
    from: Date,
    to: Date,
    granularity: string = 'day',
    requestTimeout?: number
  ): Promise<{ [date: string]: any }> {
    try {
      const queryParams = new URLSearchParams({
        granularity,
        from: format(from, DATE_FORMAT),
        to: format(to, DATE_FORMAT)
      });

      const response = await fetch(
        this.requestService.getUrl(`v2/data-providers/ghostfolio/dividends/${symbol}?${queryParams.toString()}`),
        {
          headers: await this.requestService.getRequestHeaders(),
          signal: this.requestService.createAbortSignal(requestTimeout)
        }
      );

      if (!response.ok) {
        throw new Response(await response.text(), {
          status: response.status,
          statusText: response.statusText
        });
      }

      const data = await response.json();
      return data.dividends || {};
    } catch (error) {
      this.errorService.handleDividendsError(error);
      return {};
    }
  }

  public async fetchHistorical(
    symbol: string,
    from: Date,
    to: Date,
    granularity: string = 'day',
    requestTimeout?: number
  ): Promise<{ [symbol: string]: { [date: string]: any } }> {
    try {
      const queryParams = new URLSearchParams({
        granularity,
        from: format(from, DATE_FORMAT),
        to: format(to, DATE_FORMAT)
      });

      const response = await fetch(
        this.requestService.getUrl(`v2/data-providers/ghostfolio/historical/${symbol}?${queryParams.toString()}`),
        {
          headers: await this.requestService.getRequestHeaders(),
          signal: this.requestService.createAbortSignal(requestTimeout)
        }
      );

      if (!response.ok) {
        throw new Response(await response.text(), {
          status: response.status,
          statusText: response.statusText
        });
      }

      const data = await response.json();
      return {
        [symbol]: data.historicalData || {}
      };
    } catch (error) {
      throw this.errorService.handleHistoricalError(
        error,
        symbol,
        from,
        to,
        'Ghostfolio'
      );
    }
  }
}