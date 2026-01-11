import { Module } from '@nestjs/common';
import { ConfigurationModule } from '@ghostfolio/api/services/configuration/configuration.module';
import { PropertyModule } from '@ghostfolio/api/services/property/property.module';
import { GhostfolioService } from './ghostfolio.service';
import { GhostfolioApiService } from './ghostfolio-api.service';
import { GhostfolioErrorService } from './ghostfolio-error.service';
import { GhostfolioRequestService } from './ghostfolio-request.service';

@Module({
  exports: [GhostfolioService],
  imports: [ConfigurationModule, PropertyModule],
  providers: [
    GhostfolioService,
    GhostfolioApiService,
    GhostfolioErrorService,
    GhostfolioRequestService
  ]
})
export class GhostfolioModule {}