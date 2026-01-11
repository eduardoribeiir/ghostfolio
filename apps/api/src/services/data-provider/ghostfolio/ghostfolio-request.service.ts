import { Injectable } from '@nestjs/common';
import { ConfigurationService } from '@ghostfolio/api/services/configuration/configuration.service';
import { PropertyService } from '@ghostfolio/api/services/property/property.service';
import {
  HEADER_KEY_TOKEN,
  PROPERTY_API_KEY_GHOSTFOLIO
} from '@ghostfolio/common/config';
import { GhostfolioConfig, RequestHeaders } from './interfaces/ghostfolio-config.interface';

@Injectable()
export class GhostfolioRequestService {
  private readonly config: GhostfolioConfig;

  public constructor(
    private readonly configurationService: ConfigurationService,
    private readonly propertyService: PropertyService
  ) {
    const isProduction = this.configurationService.get('NODE_ENV') === 'production';
    this.config = {
      url: isProduction
        ? 'https://ghostfol.io/api'
        : `${this.configurationService.get('ROOT_URL')}/api`,
      production: isProduction,
      rootUrl: this.configurationService.get('ROOT_URL'),
      requestTimeout: this.configurationService.get('REQUEST_TIMEOUT')
    };
  }

  public getConfig(): GhostfolioConfig {
    return this.config;
  }

  public getUrl(endpoint: string): string {
    return `${this.config.url}/${endpoint}`;
  }

  public async getRequestHeaders(): Promise<RequestHeaders> {
    const apiKey = await this.propertyService.getByKey<string>(
      PROPERTY_API_KEY_GHOSTFOLIO
    );

    return {
      [HEADER_KEY_TOKEN]: `Api-Key ${apiKey}`
    };
  }

  public createAbortSignal(timeout?: number): AbortSignal {
    return AbortSignal.timeout(timeout || this.config.requestTimeout);
  }
}