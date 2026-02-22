import { Routes } from '@angular/router';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./containers/products-grid/product-list.component').then(
        (m) => m.ProductListComponent
      ),
    title: 'Angular Dev Shop - Home',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./containers/product-detail/product-details-page.component').then(
        (m) => m.ProductDetailsPageComponent
      ),
    title: 'Product Details - Angular Dev Shop',
  },
];
