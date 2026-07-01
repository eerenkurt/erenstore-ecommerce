import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { Cart, CartItem } from '../../core/models/cart.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [],
  template: `
    <div class="max-w-2xl mx-auto px-6 py-12">
      <h1 class="text-2xl font-semibold text-gray-900 mb-8">Sepetim</h1>
      @if (loading()) {
        <div class="space-y-3">
          @for (i of [1,2,3]; track i) {
            <div class="animate-pulse flex items-center gap-4 p-4 border border-gray-100 rounded-xl">
              <div class="w-12 h-12 bg-gray-100 rounded-lg"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-gray-100 rounded w-2/3"></div>
                <div class="h-3 bg-gray-100 rounded w-1/3"></div>
              </div>
            </div>
          }
        </div>
      } @else if (!cart() || cart()!.items.length === 0) {
        <div class="text-center py-24">
          <p class="text-gray-400 text-sm">Sepetiniz boş.</p>
          <a href="/" class="mt-4 inline-block text-sm text-gray-900 font-medium hover:underline">Alışverişe Başla</a>
        </div>
      } @else {
        <div class="space-y-2 mb-6">
          @for (item of cart()!.items; track item.id) {
            <div class="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
              <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span class="text-lg font-light text-gray-300 uppercase">{{ item.productName.charAt(0) }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">{{ item.productName }}</p>
                <p class="text-xs text-gray-400">{{ formatPrice(item.unitPrice) }} / adet</p>
              </div>
              <div class="flex items-center border border-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                <button (click)="updateQty(item, item.quantity - 1)" class="px-2.5 py-1.5 text-gray-500 hover:bg-gray-100 transition-colors text-xs">-</button>
                <span class="px-3 py-1.5 text-xs font-medium text-gray-900 border-x border-gray-200">{{ item.quantity }}</span>
                <button (click)="updateQty(item, item.quantity + 1)" class="px-2.5 py-1.5 text-gray-500 hover:bg-gray-100 transition-colors text-xs">+</button>
              </div>
              <p class="text-sm font-semibold text-gray-900 w-20 text-right flex-shrink-0">{{ formatPrice(item.lineTotal) }}</p>
              <button (click)="removeItem(item.id)" class="text-gray-300 hover:text-red-400 transition-colors text-sm flex-shrink-0">x</button>
            </div>
          }
        </div>
        <div class="border-t border-gray-100 pt-6">
          <div class="flex items-center justify-between mb-6">
            <span class="text-sm text-gray-500">Toplam</span>
            <span class="text-xl font-semibold text-gray-900">{{ formatPrice(cart()!.totalAmount) }}</span>
          </div>
          @if (errorMsg()) {
            <p class="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-4">{{ errorMsg() }}</p>
          }
          <button (click)="placeOrder()" [disabled]="placingOrder()"
            class="w-full py-3 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50">
            {{ placingOrder() ? 'Sipariş veriliyor...' : 'Sipariş Ver' }}
          </button>
        </div>
      }
    </div>
  `,
})
export class CartComponent implements OnInit {
  cart = signal<Cart | null>(null);
  loading = signal(true);
  placingOrder = signal(false);
  errorMsg = signal('');

  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private router = inject(Router);

  ngOnInit(): void { this.loadCart(); }

  loadCart(): void {
    this.loading.set(true);
    this.cartService.getCart().subscribe({
      next: (c) => { this.cart.set(c); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  updateQty(item: CartItem, qty: number): void {
    if (qty < 1) { this.removeItem(item.id); return; }
    this.cartService.updateItem(item.id, qty).subscribe({ next: () => this.loadCart() });
  }

  removeItem(id: number): void {
    this.cartService.removeItem(id).subscribe({ next: () => this.loadCart() });
  }

  placeOrder(): void {
    this.placingOrder.set(true);
    this.errorMsg.set('');
    this.orderService.placeOrder().subscribe({
      next: () => this.router.navigate(['/siparislerim']),
      error: (err) => {
        this.errorMsg.set(err.error?.message ?? 'Sipariş verilemedi.');
        this.placingOrder.set(false);
      },
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
  }
}
