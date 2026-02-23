import { Component, signal } from '@angular/core';
import { MainLayoutComponent } from "@core/layout/main-layout.component";

@Component({
  selector: 'app-root',
  imports: [MainLayoutComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('angular-dev-shop');
}
