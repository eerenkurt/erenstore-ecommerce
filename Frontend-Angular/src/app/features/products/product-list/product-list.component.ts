import { Component, inject, signal, OnInit } from '@angular/core';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product } from '../../../core/models/product.model';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [ProductCardComponent],
  template: `
    <div class="max-w-6xl mx-auto px-6 py-12">
      <div class="mb-10">
        <h1 class="text-3xl font-semibold text-gray-900">Ürünler</h1>
        <p class="mt-2 text-sm text-gray-400">{{ products().length }} ürün listeleniyor</p>
      </div>
      @if (loading()) {
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          @for (i of [1,2,3,4,5,6,7,8]; track i) {
            <div class="border border-gray-100 rounded-xl overflow-hidden animate-pulse">
              <div class="aspect-square bg-gray-100"></div>
              <div class="p-4 space-y-2">
                <div class="h-3 bg-gray-100 rounded w-1/3"></div>
                <div class="h-4 bg-gray-100 rounded w-3/4"></div>
                <div class="h-5 bg-gray-100 rounded w-1/2 mt-1"></div>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          @for (product of products(); track product.id) {
            <app-product-card
              [product]="product"
              [showAddToCart]="isCustomer()"
              (addToCart)="onAddToCart($event)" />
          }
        </div>
      }
      @if (toastMessage()) {
        <div class="fixed bottom-6 right-6 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg">
          {{ toastMessage() }}
        </div>
      }
    </div>
  `,
})
export class ProductListComponent implements OnInit {
  products = signal<Product[]>([]);
  loading = signal(true);
  toastMessage = signal('');

  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private auth = inject(AuthService);

  isCustomer(): boolean {
    return this.auth.currentRole() === 'Customer';
  }

  ngOnInit(): void {
    this.productService.getAll().subscribe({
      next: (data) => { this.products.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onAddToCart(product: Product): void {
    this.cartService.addItem(product.id, 1).subscribe({
      next: () => this.showToast('Sepete eklendi'),
      error: (err) => this.showToast(err.error?.message ?? 'Hata oluştu'),
    });
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(''), 2500);
  }
}
