import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div class="w-full max-w-sm">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-semibold text-gray-900">Giriş Yap</h1>
          <p class="mt-1 text-sm text-gray-500">Hesabınıza erişin</p>
        </div>
        <form (ngSubmit)="onSubmit()" #form="ngForm" class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1.5">E-posta</label>
            <input type="email" name="email" [(ngModel)]="email" required
              class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors bg-white" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1.5">Şifre</label>
            <input type="password" name="password" [(ngModel)]="password" required
              class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors bg-white" />
          </div>
          @if (error()) {
            <p class="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{{ error() }}</p>
          }
          <button type="submit" [disabled]="loading()"
            class="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50">
            {{ loading() ? 'Giriş yapılıyor...' : 'Giriş Yap' }}
          </button>
        </form>
        <p class="mt-6 text-center text-sm text-gray-500">
          Hesabınız yok mu?
          <a routerLink="/kayit" class="text-gray-900 font-medium hover:underline ml-1">Kayıt Ol</a>
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  private auth = inject(AuthService);
  private router = inject(Router);

  onSubmit(): void {
    if (!this.email || !this.password) return;
    this.loading.set(true);
    this.error.set('');
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        const role = this.auth.currentRole();
        if (role === 'Customer') this.router.navigate(['/']);
        else if (role === 'Seller') this.router.navigate(['/urunlerim']);
        else if (role === 'Admin') this.router.navigate(['/admin']);
        else this.router.navigate(['/']);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Giriş başarısız. E-posta veya şifre hatalı.');
        this.loading.set(false);
      },
    });
  }
}
