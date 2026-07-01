import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { OrderService } from '../../../core/services/order.service';
import { PendingSeller } from '../../../core/models/admin.model';
import { Order, ORDER_STATUS_LABELS, ORDER_STATUS_CLASSES } from '../../../core/models/order.model';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="max-w-5xl mx-auto px-6 py-12">
      <h1 class="text-2xl font-semibold text-gray-900 mb-10">Admin Panel</h1>

      <!-- Pending Sellers -->
      <section class="mb-12">
        <h2 class="text-base font-medium text-gray-900 mb-4">Onay Bekleyen Satıcılar</h2>
        @if (pendingSellers().length === 0) {
          <p class="text-sm text-gray-400 py-8 text-center border border-gray-100 rounded-xl">Onay bekleyen satıcı yok.</p>
        } @else {
          <div class="border border-gray-100 rounded-xl overflow-hidden">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-100">
                  <th class="text-left px-5 py-3 text-xs font-medium text-gray-400">Satıcı</th>
                  <th class="text-left px-5 py-3 text-xs font-medium text-gray-400">Mağaza</th>
                  <th class="text-left px-5 py-3 text-xs font-medium text-gray-400">E-posta</th>
                  <th class="text-left px-5 py-3 text-xs font-medium text-gray-400">Kayıt</th>
                  <th class="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                @for (seller of pendingSellers(); track seller.id) {
                  <tr class="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td class="px-5 py-4 font-medium text-gray-900">{{ seller.firstName }} {{ seller.lastName }}</td>
                    <td class="px-5 py-4 text-gray-600">{{ seller.storeName }}</td>
                    <td class="px-5 py-4 text-gray-500 text-xs">{{ seller.email }}</td>
                    <td class="px-5 py-4 text-gray-400 text-xs">{{ formatDate(seller.createdDate) }}</td>
                    <td class="px-5 py-4">
                      <div class="flex items-center justify-end gap-2">
                        <button (click)="approveSeller(seller.id, true)" class="text-xs px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors">Onayla</button>
                        <button (click)="approveSeller(seller.id, false)" class="text-xs px-3 py-1.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors">Reddet</button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
        @if (sellerMessage()) {
          <p class="mt-3 text-xs text-gray-600">{{ sellerMessage() }}</p>
        }
      </section>

      <!-- All Orders -->
      <section>
        <h2 class="text-base font-medium text-gray-900 mb-4">Tüm Siparişler</h2>
        @if (ordersLoading()) {
          <div class="space-y-3">
            @for (i of [1,2,3]; track i) {
              <div class="animate-pulse h-14 bg-gray-50 rounded-xl"></div>
            }
          </div>
        } @else if (orders().length === 0) {
          <p class="text-sm text-gray-400 py-8 text-center border border-gray-100 rounded-xl">Henüz sipariş yok.</p>
        } @else {
          <div class="border border-gray-100 rounded-xl overflow-hidden">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-100">
                  <th class="text-left px-5 py-3 text-xs font-medium text-gray-400">Sipariş</th>
                  <th class="text-left px-5 py-3 text-xs font-medium text-gray-400">Müşteri</th>
                  <th class="text-left px-5 py-3 text-xs font-medium text-gray-400">Tarih</th>
                  <th class="text-right px-5 py-3 text-xs font-medium text-gray-400">Tutar</th>
                  <th class="text-left px-5 py-3 text-xs font-medium text-gray-400">Durum</th>
                  <th class="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                @for (order of orders(); track order.id) {
                  <tr class="border-b border-gray-50 last:border-0">
                    <td class="px-5 py-4 font-medium text-gray-900">#{{ order.id }}</td>
                    <td class="px-5 py-4 text-gray-500 text-xs">ID: {{ order.customerId }}</td>
                    <td class="px-5 py-4 text-gray-400 text-xs">{{ formatDate(order.createdDate) }}</td>
                    <td class="px-5 py-4 text-right font-medium text-gray-900">{{ formatPrice(order.totalAmount) }}</td>
                    <td class="px-5 py-4">
                      <span [class]="statusClass(order.status)" class="text-xs font-medium px-2.5 py-1 rounded-full">{{ statusLabel(order.status) }}</span>
                    </td>
                    <td class="px-5 py-4">
                      <select [(ngModel)]="selectedStatuses[order.id]" (ngModelChange)="updateStatus(order.id, $event)"
                        class="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-gray-400 bg-white">
                        @for (s of statusOptions; track s.value) {
                          <option [value]="s.value">{{ s.label }}</option>
                        }
                      </select>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </section>
    </div>
  `,
})
export class AdminPanelComponent implements OnInit {
  pendingSellers = signal<PendingSeller[]>([]);
  orders = signal<Order[]>([]);
  ordersLoading = signal(true);
  sellerMessage = signal('');
  selectedStatuses: Record<number, number> = {};

  readonly statusOptions = [
    { value: 1, label: 'Yeni' },
    { value: 2, label: 'İşleniyor' },
    { value: 3, label: 'Kargoda' },
    { value: 4, label: 'Teslim Edildi' },
    { value: 5, label: 'İptal Edildi' },
  ];

  private adminService = inject(AdminService);
  private orderService = inject(OrderService);

  ngOnInit(): void {
    this.adminService.getPendingSellers().subscribe({
      next: (data) => this.pendingSellers.set(data),
    });
    this.orderService.getAllOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
        data.forEach(o => this.selectedStatuses[o.id] = o.status);
        this.ordersLoading.set(false);
      },
      error: () => this.ordersLoading.set(false),
    });
  }

  approveSeller(userId: number, isApproved: boolean): void {
    this.adminService.approveSeller({ userId, isApproved }).subscribe({
      next: (res) => {
        this.sellerMessage.set(res.message);
        this.pendingSellers.update(sellers => sellers.filter(s => s.id !== userId));
        setTimeout(() => this.sellerMessage.set(''), 3000);
      },
    });
  }

  updateStatus(orderId: number, status: number): void {
    this.orderService.updateOrderStatus(orderId, Number(status)).subscribe({
      next: () => {
        this.orders.update(orders =>
          orders.map(o => o.id === orderId ? { ...o, status: Number(status) } : o)
        );
      },
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
