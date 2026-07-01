import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div class="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <a routerLink="/" class="text-base font-semibold tracking-tight text-gray-900">ErenStore</a>
        <div class="flex items-center gap-6 text-sm text-gray-500">
          <a routerLink="/" routerLinkActive="text-gray-900" [routerLinkActiveOptions]="{exact:true}" class="hover:text-gray-900 transition-colors">Ürünler</a>
          @if (auth.isLoggedIn() && auth.currentRole() === 'Customer') {
            <a routerLink="/sepetim" routerLinkActive="text-gray-900" class="hover:text-gray-900 transition-colors">Sepetim</a>
            <a routerLink="/siparislerim" routerLinkActive="text-gray-900" class="hover:text-gray-900 transition-colors">Siparişlerim</a>
          }
          @if (auth.isLoggedIn() && auth.currentRole() === 'Seller') {
            <a routerLink="/urunlerim" routerLinkActive="text-gray-900" class="hover:text-gray-900 transition-colors">Ürünlerim</a>
          }
          @if (auth.isLoggedIn() && auth.currentRole() === 'Admin') {
            <a routerLink="/admin" routerLinkActive="text-gray-900" class="hover:text-gray-900 transition-colors">Admin Panel</a>
          }
          @if (!auth.isLoggedIn()) {
            <a routerLink="/giris" routerLinkActive="text-gray-900" class="hover:text-gray-900 transition-colors">Giriş Yap</a>
            <a routerLink="/kayit" class="px-4 py-1.5 bg-gray-900 text-white text-sm rounded-md hover:bg-gray-700 transition-colors">Kayıt Ol</a>
          } @else {
            <button (click)="auth.logout()" class="hover:text-gray-900 transition-colors cursor-pointer">Çıkış</button>
          }
        </div>
      </div>
    </nav>
  `,
})
export class NavbarComponent {
  auth = inject(AuthService);
}
