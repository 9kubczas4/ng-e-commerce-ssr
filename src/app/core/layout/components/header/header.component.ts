import { Component, ChangeDetectionStrategy, inject, output } from '@angular/core';
import { BasketService } from '@core/services/basket.service';
import { ThemeToggleComponent } from '@core/layout/components/theme-toggle/theme-toggle.component';

/* eslint-disable @angular-eslint/component-selector */
@Component({
  selector: 'header[appHeader]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ThemeToggleComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  private basketService = inject(BasketService);

  basketItemCount = this.basketService.basket;
  basketClick = output<void>();

  onBasketClick(): void {
    this.basketClick.emit();
  }
}
