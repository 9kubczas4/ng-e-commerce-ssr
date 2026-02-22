import { Component, ChangeDetectionStrategy, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { BasketSidebarComponent } from './components/basket-sidebar/basket-sidebar.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, HeaderComponent, BasketSidebarComponent, FooterComponent],
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
