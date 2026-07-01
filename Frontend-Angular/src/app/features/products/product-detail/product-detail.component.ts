import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product } from '../../../core/models/product.model';
import { ProductPlaceholderComponent } from '../../../shared/components/product-placeholder/product-placeholder.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [ProductPlaceholderComponent],
  template: `
    <div class="max-w-4xl mx-auto px-6 py-12">
      @if (loading()) {
        <div class="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-12">
          <div class="aspect-square bg-gray-100 rounded-xl"></div>
          <div class="space-y-4 pt-4">
            <div class="h-6 bg-gray-100 rounded w-3/4"></div>
            <div class="h-8 bg-gray-100 rounded w-1/3"></div>
          </div>
        </div>
      } @else if (product()) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <app-product-placeholder [name]="product()!.name" />
          </div>
          <div class="py-4 flex flex-col gap-6">
            <div>
              <h1 class="text-2xl font-semibold text-gray-900">{{ product()!.name }}</h1>
              @if (product()!.description) {
                <p class="mt-3 text-sm text-gray-500 leading-relaxed">{{ product()!.description }}</p>
              }
            </div>
            <div>
              <p class="text-3xl font-semibold text-gray-900">{{ formatPrice(product()!.price) }}</p>
              <p class="mt-1 text-xs text-gray-400">{{ product()!.stock > 0 ? product()!.stock + ' adet stokta' : 'Stok tükendi' }}</p>
            </div>
            @if (isCustomer() && product()!.stock > 0) {
              <div class="flex items-center gap-3">
                <div class="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button (click)="decrementQty()" class="px-3 py-2 text-gray-500 hover:bg-gray-50 transition-colors text-sm">-</button>
                  <span class="px-4 py-2 text-sm font-medium text-gray-900 border-x border-gray-200">{{ qty }}</span>
                  <button (click)="incrementQty()" class="px-3 py-2 text-gray-500 hover:bg-gray-50 transition-colors text-sm">+</button>
                </div>
                <button (click)="addToCart()" [disabled]="addingToCart()"
                  class="flex-1 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50">
                  {{ addingToCart() ? 'Ekleniyor...' : 'Sepete Ekle' }}
                </button>
              </div>
              @if (toastMessage()) {
                <p class="text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg">{{ toastMessage() }}</p>
              }
            }
          </div>
        </div>
      } @else {
        <div class="text-center py-24">
          <p class="text-gray-400 text-sm">Ürün bulunamadı.</p>
        </div>
      }
    </div>
  `,
})
export class ProductDetailComponent implements OnInit {
  product = signal<Product | null>(null);
  loading = signal(true);
  addingToCart = signal(false);
  toastMessage = signal('');
  qty = 1;

  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private auth = inject(AuthService);

  isCustomer(): boolean { return this.auth.currentRole() === 'Customer'; }

  decrementQty(): void { if (this.qty > 1) this.qty--; }
  incrementQty(): void { const p = this.product(); if (p && this.qty < p.stock) this.qty++; }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getById(id).subscribe({
      next: (p) => { this.product.set(p); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  addToCart(): void {
    const p = this.product();
    if (!p) return;
    this.addingToCart.set(true);
    this.cartService.addItem(p.id, this.qty).subscribe({
      next: () => {
        this.toastMessage.set('Sepete eklendi');
        this.addingToCart.set(false);
        setTimeout(() => this.toastMessage.set(''), 2500);
      },
      error: (err) => {
        this.toastMessage.set(err.error?.message ?? 'Hata');
        this.addingToCart.set(false);
      },
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
  }
}
