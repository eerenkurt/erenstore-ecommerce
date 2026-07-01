import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/products/product-list/product-list.component').then(m => m.ProductListComponent) },
  { path: 'urun/:id', loadComponent: () => import('./features/products/product-detail/product-detail.component').then(m => m.ProductDetailComponent) },
  { path: 'giris', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'kayit', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
  { path: 'sepetim', loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent), canActivate: [roleGuard('Customer')] },
  { path: 'siparislerim', loadComponent: () => import('./features/orders/my-orders/my-orders.component').then(m => m.MyOrdersComponent), canActivate: [roleGuard('Customer')] },
  { path: 'urunlerim', loadComponent: () => import('./features/seller/my-products/my-products.component').then(m => m.MyProductsComponent), canActivate: [roleGuard('Seller')] },
  { path: 'admin', loadComponent: () => import('./features/admin/admin-panel/admin-panel.component').then(m => m.AdminPanelComponent), canActivate: [roleGuard('Admin')] },
  { path: '**', redirectTo: '' },
];
