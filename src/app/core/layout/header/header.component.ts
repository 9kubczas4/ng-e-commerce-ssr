import { Component, ChangeDetectionStrategy, inject, output } from '@angular/core';
import { BasketService } from '../../services/basket.service';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle/theme-toggle.component';

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
