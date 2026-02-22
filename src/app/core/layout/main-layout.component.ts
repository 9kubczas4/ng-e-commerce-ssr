import { Component, ChangeDetectionStrategy, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { BasketSidebarComponent } from './components/basket-sidebar/basket-sidebar.component';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, HeaderComponent, BasketSidebarComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainLayoutComponent {
  basketSidebar = viewChild.required(BasketSidebarComponent);

  onBasketClick(): void {
    this.basketSidebar().open();
  }
}
