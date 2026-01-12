import { Component, Input, Output, EventEmitter } from '@angular/core';
import { User } from '@ghostfolio/common/interfaces';

/**
 * Presentational component for the user menu
 * Handles user-related actions and display
 */
@Component({
  selector: 'gf-header-user-menu',
  template: `
    <div class="user-menu">
      <button mat-icon-button [matMenuTriggerFor]="menu">
        <ion-icon name="person-circle-outline"></ion-icon>
      </button>
      <mat-menu #menu="matMenu">
        <button mat-menu-item (click)="onAccountClick()">
          Account Settings
        </button>
        <button mat-menu-item (click)="onSignOutClick()">
          Sign Out
        </button>
      </mat-menu>
    </div>
  `,
  styleUrls: ['./header-user-menu.component.scss']
})
export class GfHeaderUserMenuComponent {
  @Input() user: User;
  @Input() hasImpersonationId: boolean;
  
  @Output() accountClick = new EventEmitter<void>();
  @Output() signOutClick = new EventEmitter<void>();

  public onAccountClick(): void {
    this.accountClick.emit();
  }

  public onSignOutClick(): void {
    this.signOutClick.emit();
  }
}
