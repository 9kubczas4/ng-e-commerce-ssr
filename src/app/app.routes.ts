import { Routes } from '@angular/router';
import { basketGuard } from './core/guards/basket.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'product',
    pathMatch: 'full'
  },
  {
    path: 'product',
    loadChildren: () =>
      import('./features/products/products.routes').then((m) => m.PRODUCTS_ROUTES),
  },
  {
    path: 'checkout',
    loadChildren: () =>
      import('./features/checkout/checkout.routes').then(
        (m) => m.CHECKOUT_ROUTES
      ),
    canActivate: [basketGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
