import { Injectable, Logger } from '@nestjs/common';
import { StatusCodes } from 'http-status-codes';

@Injectable()
export class GhostfolioErrorService {
  public handleAssetProfileError(error: any, symbol: string, requestTimeout: number): void {
    let message = error;

    if (['AbortError', 'TimeoutError'].includes(error?.name)) {
      message = `RequestError: The operation to get the asset profile for ${symbol} was aborted because the request to the data provider took more than ${(
        requestTimeout / 1000
      ).toFixed(3)} seconds`;
    } else if (error?.status === StatusCodes.TOO_MANY_REQUESTS) {
      message = 'RequestError: The daily request limit has been exceeded';
    } else if (
      [StatusCodes.FORBIDDEN, StatusCodes.UNAUTHORIZED].includes(
        error?.status
      )
    ) {
      message =
        'RequestError: The API key is invalid. Please update it in the Settings section of the Admin Control panel.';
    }

    Logger.error(message, 'GhostfolioService');
  }

  public handleQuotesError(error: any, symbols: string[], requestTimeout: number): void {
    let message = error;

    if (['AbortError', 'TimeoutError'].includes(error?.name)) {
      message = `RequestError: The operation to get the quotes for ${symbols.join(
        ', '
      )} was aborted because the request to the data provider took more than ${(
        requestTimeout / 1000
      ).toFixed(3)} seconds`;
    } else if (error?.status === StatusCodes.TOO_MANY_REQUESTS) {
      message = 'RequestError: The daily request limit has been exceeded';
    } else if (
      [StatusCodes.FORBIDDEN, StatusCodes.UNAUTHORIZED].includes(
        error?.status
      )
    ) {
      message =
        'RequestError: The API key is invalid. Please update it in the Settings section of the Admin Control panel.';
    }

    Logger.error(message, 'GhostfolioService');
  }

  public handleSearchError(error: any, query: string, requestTimeout: number): void {
    let message = error;

    if (['AbortError', 'TimeoutError'].includes(error?.name)) {
      message = `RequestError: The operation to search for ${query} was aborted because the request to the data provider took more than ${(
        requestTimeout / 1000
      ).toFixed(3)} seconds`;
    } else if (error?.status === StatusCodes.TOO_MANY_REQUESTS) {
      message = 'RequestError: The daily request limit has been exceeded';
    } else if (
      [StatusCodes.FORBIDDEN, StatusCodes.UNAUTHORIZED].includes(
        error?.status
      )
    ) {
      message =
        'RequestError: The API key is invalid. Please update it in the Settings section of the Admin Control panel.';
    }

    Logger.error(message, 'GhostfolioService');
  }

  public handleDividendsError(error: any): void {
    let message = error;

    if (error?.status === StatusCodes.TOO_MANY_REQUESTS) {
      message = 'RequestError: The daily request limit has been exceeded';
    } else if (
      [StatusCodes.FORBIDDEN, StatusCodes.UNAUTHORIZED].includes(
        error?.status
      )
    ) {
      message =
        'RequestError: The API key is invalid. Please update it in the Settings section of the Admin Control panel.';
    }

    Logger.error(message, 'GhostfolioService');
  }

  public handleHistoricalError(error: any, symbol: string, from: Date, to: Date, providerName: string): Error {
    if (error?.status === StatusCodes.TOO_MANY_REQUESTS) {
      error.name = 'RequestError';
      error.message =
        'RequestError: The daily request limit has been exceeded';
    } else if (
      [StatusCodes.FORBIDDEN, StatusCodes.UNAUTHORIZED].includes(
        error?.status
      )
    ) {
      error.name = 'RequestError';
      error.message =
        'RequestError: The API key is invalid. Please update it in the Settings section of the Admin Control panel.';
    }

    Logger.error(error.message, 'GhostfolioService');

    return new Error(
      `Could not get historical market data for ${symbol} (${providerName}) from ${format(
        from,
        DATE_FORMAT
      )} to ${format(to, DATE_FORMAT)}: [${error.name}] ${error.message}`
    );
  }
}