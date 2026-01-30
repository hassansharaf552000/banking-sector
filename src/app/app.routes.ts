import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/components/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/components/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'customer/:cif',
    loadComponent: () =>
      import('./features/customer/components/customer-details/customer-details.component').then(
        (m) => m.CustomerDetailsComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'customer/:cif/account/:accountId/transactions',
    loadComponent: () =>
      import('./features/transactions/components/transactions-list/transactions-list.component').then(
        (m) => m.TransactionsListComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/components/not-found/not-found.component').then((m) => m.NotFoundComponent),
    canActivate: [authGuard],
  },
];
