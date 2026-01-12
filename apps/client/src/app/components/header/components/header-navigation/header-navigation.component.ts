import { Component, Input, Output, EventEmitter } from '@angular/core';

import { HeaderConfig, DEFAULT_HEADER_CONFIG } from '../../header.models';

/**
 * Presentational component for the header navigation
 * Responsible only for displaying navigation UI
 */
@Component({
  selector: 'gf-header-navigation',
  template: `
    <nav class="header-navigation">
      <a [routerLink]="routerLinkPortfolio">Portfolio</a>
      <a [routerLink]="routerLinkAccounts">Accounts</a>
      <a [routerLink]="routerLinkMarkets">Markets</a>
    </nav>
  `,
  styleUrls: ['./header-navigation.component.scss']
})
export class GfHeaderNavigationComponent {
  @Input() config: HeaderConfig = DEFAULT_HEADER_CONFIG;
  @Output() navigationClick = new EventEmitter<string>();

  public routerLinkPortfolio = '/portfolio';
  public routerLinkAccounts = '/accounts';
  public routerLinkMarkets = '/markets';
}
