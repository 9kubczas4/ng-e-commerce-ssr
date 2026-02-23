import { Routes } from '@angular/router';

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
    path: 'complaint',
    loadChildren: () =>
      import('./features/complaint-form/complaint-form.routes').then(
        (m) => m.COMPLAINT_FORM_ROUTES
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
