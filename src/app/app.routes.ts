import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./core/layout/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/products/containers/product-list/product-list.component').then(
            (m) => m.ProductListComponent
          ),
        title: 'Angular Dev Shop - Home',
      },
      // {
      //   path: 'product/:id',
      //   loadComponent: () =>
      //     import('./features/product-details/containers/product-details-page/product-details-page.component').then(
      //       (m) => m.ProductDetailsPageComponent
      //     ),
      //   title: 'Product Details - Angular Dev Shop',
      // },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
