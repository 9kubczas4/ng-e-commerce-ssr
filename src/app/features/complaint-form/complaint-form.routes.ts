import { Routes } from '@angular/router';

export const COMPLAINT_FORM_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./containers/complaint-form/complaint-form.component').then(
        (m) => m.ComplaintFormComponent
      ),
  },
];
