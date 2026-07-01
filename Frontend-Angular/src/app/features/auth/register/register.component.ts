import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-sm">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-semibold text-gray-900">Kayıt Ol</h1>
          <p class="mt-1 text-sm text-gray-500">Yeni hesap oluşturun</p>
        </div>
        <form (ngSubmit)="onSubmit()" class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1.5">Ad</label>
              <input type="text" name="firstName" [(ngModel)]="firstName" required
                class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors bg-white" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1.5">Soyad</label>
              <input type="text" name="lastName" [(ngModel)]="lastName" required
                class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors bg-white" />
            </div>
          </div>
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
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1.5">Hesap Türü</label>
            <div class="grid grid-cols-2 gap-2">
              <button type="button" (click)="userType = 3"
                [class]="userType === 3 ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400'"
                class="py-2 text-sm border rounded-lg transition-colors">Müşteri</button>
              <button type="button" (click)="userType = 2"
                [class]="userType === 2 ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400'"
                class="py-2 text-sm border rounded-lg transition-colors">Satıcı</button>
            </div>
          </div>
          @if (userType === 2) {
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1.5">Mağaza Adı</label>
              <input type="text" name="storeName" [(ngModel)]="storeName"
                class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors bg-white" />
            </div>
          }
          @if (error()) {
            <p class="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{{ error() }}</p>
          }
          @if (success()) {
            <p class="text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg">{{ success() }}</p>
          }
          <button type="submit" [disabled]="loading()"
            class="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50">
            {{ loading() ? 'Kaydediliyor...' : 'Kayıt Ol' }}
          </button>
        </form>
        <p class="mt-6 text-center text-sm text-gray-500">
          Hesabınız var mı?
          <a routerLink="/giris" class="text-gray-900 font-medium hover:underline ml-1">Giriş Yap</a>
        </p>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  storeName = '';
  userType = 3;
  loading = signal(false);
  error = signal('');
  success = signal('');

  private auth = inject(AuthService);
  private router = inject(Router);

  onSubmit(): void {
    this.loading.set(true);
    this.error.set('');
    this.success.set('');
    const req: any = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
      userType: this.userType,
    };
    if (this.userType === 2 && this.storeName) req.storeName = this.storeName;
    this.auth.register(req).subscribe({
      next: (res) => {
        this.success.set(res.message || 'Kayıt başarılı! Giriş yapabilirsiniz.');
        this.loading.set(false);
        setTimeout(() => this.router.navigate(['/giris']), 2000);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Kayıt başarısız.');
        this.loading.set(false);
      },
    });
  }
}
