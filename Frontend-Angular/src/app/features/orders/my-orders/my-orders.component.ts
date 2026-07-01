import { Component, inject, signal, OnInit } from '@angular/core';
import { OrderService } from '../../../core/services/order.service';
import { Order, ORDER_STATUS_LABELS, ORDER_STATUS_CLASSES } from '../../../core/models/order.model';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [],
  template: `
    <div class="max-w-3xl mx-auto px-6 py-12">
      <h1 class="text-2xl font-semibold text-gray-900 mb-8">Siparişlerim</h1>
      @if (loading()) {
        <div class="space-y-4">
          @for (i of [1,2]; track i) {
            <div class="animate-pulse border border-gray-100 rounded-xl p-5 space-y-3">
              <div class="h-4 bg-gray-100 rounded w-1/3"></div>
              <div class="h-3 bg-gray-100 rounded w-1/4"></div>
            </div>
          }
        </div>
      } @else if (orders().length === 0) {
        <div class="text-center py-24">
          <p class="text-gray-400 text-sm">Henüz siparişiniz yok.</p>
        </div>
      } @else {
        <div class="space-y-4">
          @for (order of orders(); track order.id) {
            <div class="border border-gray-100 rounded-xl overflow-hidden">
              <div class="px-5 py-4 flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-900">Sipariş #{{ order.id }}</p>
                  <p class="text-xs text-gray-400 mt-0.5">{{ formatDate(order.createdDate) }}</p>
                </div>
                <div class="flex items-center gap-4">
                  <span class="text-sm font-semibold text-gray-900">{{ formatPrice(order.totalAmount) }}</span>
                  <span [class]="statusClass(order.status)" class="text-xs font-medium px-2.5 py-1 rounded-full">{{ statusLabel(order.status) }}</span>
                </div>
              </div>
              <div class="border-t border-gray-50 px-5 py-3 space-y-1.5">
                @for (item of order.orderItems; track item.id) {
                  <div class="flex items-center justify-between text-xs text-gray-500">
                    <span>{{ item.productName }} <span class="text-gray-400">x{{ item.quantity }}</span></span>
                    <span>{{ formatPrice(item.price * item.quantity) }}</span>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class MyOrdersComponent implements OnInit {
  orders = signal<Order[]>([]);
  loading = signal(true);

  private orderService = inject(OrderService);

  ngOnInit(): void {
    this.orderService.getMyOrders().subscribe({
      next: (data) => { this.orders.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  statusLabel(status: number): string { return ORDER_STATUS_LABELS[status] ?? 'Bilinmiyor'; }
  statusClass(status: number): string { return ORDER_STATUS_CLASSES[status] ?? 'bg-gray-100 text-gray-500'; }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}
