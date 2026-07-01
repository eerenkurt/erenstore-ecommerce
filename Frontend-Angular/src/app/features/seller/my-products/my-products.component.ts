import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-my-products',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="max-w-4xl mx-auto px-6 py-12">
      <h1 class="text-2xl font-semibold text-gray-900 mb-8">Ürünlerim</h1>

      @if (pendingMessage()) {
        <div class="mb-8 p-4 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-800">
          {{ pendingMessage() }}
        </div>
      }

      @if (!pendingMessage()) {
        <div class="mb-8 border border-gray-100 rounded-xl p-6">
          <h2 class="text-sm font-medium text-gray-900 mb-4">{{ editingProduct() ? 'Ürünü Güncelle' : 'Yeni Ürün Ekle' }}</h2>
          <form (ngSubmit)="onSubmit()" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="sm:col-span-2">
              <label class="block text-xs font-medium text-gray-700 mb-1.5">Ürün Adı</label>
              <input type="text" name="name" [(ngModel)]="form.name" required
                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-xs font-medium text-gray-700 mb-1.5">Açıklama (opsiyonel)</label>
              <textarea name="description" [(ngModel)]="form.description" rows="2"
                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors resize-none"></textarea>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1.5">Fiyat (₺)</label>
              <input type="number" name="price" [(ngModel)]="form.price" min="0" step="0.01" required
                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1.5">Stok Adedi</label>
              <input type="number" name="stock" [(ngModel)]="form.stock" min="0" required
                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors" />
            </div>
            @if (formError()) {
              <div class="sm:col-span-2">
                <p class="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{{ formError() }}</p>
              </div>
            }
            @if (formSuccess()) {
              <div class="sm:col-span-2">
                <p class="text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg">{{ formSuccess() }}</p>
              </div>
            }
            <div class="sm:col-span-2 flex gap-3">
              <button type="submit" [disabled]="formLoading()"
                class="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50">
                {{ formLoading() ? 'Kaydediliyor...' : (editingProduct() ? 'Güncelle' : 'Ekle') }}
              </button>
              @if (editingProduct()) {
                <button type="button" (click)="cancelEdit()"
                  class="px-5 py-2 border border-gray-200 text-sm text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                  İptal
                </button>
              }
            </div>
          </form>
        </div>
      }

      @if (loading()) {
        <div class="space-y-2">
          @for (i of [1,2,3]; track i) {
            <div class="animate-pulse h-16 bg-gray-50 rounded-xl"></div>
          }
        </div>
      } @else if (products().length === 0) {
        <p class="text-sm text-gray-400 text-center py-12">Henüz ürün eklemediniz.</p>
      } @else {
        <div class="border border-gray-100 rounded-xl overflow-hidden">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-100">
                <th class="text-left px-5 py-3 text-xs font-medium text-gray-400">Ürün</th>
                <th class="text-right px-5 py-3 text-xs font-medium text-gray-400">Fiyat</th>
                <th class="text-right px-5 py-3 text-xs font-medium text-gray-400">Stok</th>
                <th class="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              @for (product of products(); track product.id) {
                <tr class="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td class="px-5 py-4 font-medium text-gray-900">{{ product.name }}</td>
                  <td class="px-5 py-4 text-right text-gray-600">{{ formatPrice(product.price) }}</td>
                  <td class="px-5 py-4 text-right">
                    <span [class]="product.stock > 0 ? 'text-gray-600' : 'text-red-400'">{{ product.stock }}</span>
                  </td>
                  <td class="px-5 py-4 text-right">
                    <div class="flex items-center justify-end gap-3">
                      <button (click)="startEdit(product)" class="text-xs text-gray-500 hover:text-gray-900 transition-colors">Düzenle</button>
                      <button (click)="deleteProduct(product.id)" class="text-xs text-gray-400 hover:text-red-500 transition-colors">Sil</button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class MyProductsComponent implements OnInit {
  products = signal<Product[]>([]);
  loading = signal(true);
  editingProduct = signal<Product | null>(null);
  formLoading = signal(false);
  formError = signal('');
  formSuccess = signal('');
  pendingMessage = signal('');

  form: { name: string; description: string; price: number | null; stock: number | null } = {
    name: '', description: '', price: null, stock: null,
  };

  private productService = inject(ProductService);

  ngOnInit(): void { this.loadProducts(); }

  loadProducts(): void {
    this.loading.set(true);
    this.productService.getMyProducts().subscribe({
      next: (data) => { this.products.set(data); this.loading.set(false); },
      error: (err) => {
        if (err.status === 403 || err.error?.message?.toLowerCase().includes('onay')) {
          this.pendingMessage.set(err.error?.message ?? 'Mağazanız henüz onaylanmamış. Onay sonrası ürün ekleyebilirsiniz.');
        }
        this.loading.set(false);
      },
    });
  }

  startEdit(product: Product): void {
    this.editingProduct.set(product);
    this.form = { name: product.name, description: product.description ?? '', price: product.price, stock: product.stock };
    this.formError.set('');
    this.formSuccess.set('');
  }

  cancelEdit(): void {
    this.editingProduct.set(null);
    this.resetForm();
  }

  onSubmit(): void {
    if (!this.form.name || this.form.price == null || this.form.stock == null) return;
    this.formLoading.set(true);
    this.formError.set('');
    this.formSuccess.set('');

    const editing = this.editingProduct();
    const obs = editing
      ? this.productService.update({
          id: editing.id,
          name: this.form.name,
          description: this.form.description,
          price: this.form.price!,
          stock: this.form.stock!,
        })
      : this.productService.create({
          name: this.form.name,
          price: this.form.price!,
          stock: this.form.stock!,
          description: this.form.description,
        });

    obs.subscribe({
      next: () => {
        this.formSuccess.set(editing ? 'Ürün güncellendi.' : 'Ürün eklendi.');
        this.formLoading.set(false);
        this.editingProduct.set(null);
        this.resetForm();
        setTimeout(() => this.formSuccess.set(''), 2500);
        this.loadProducts();
      },
      error: (err) => {
        const msg = err.error?.message ?? 'Hata oluştu.';
        if (msg.toLowerCase().includes('onay') || msg.toLowerCase().includes('pending')) {
          this.pendingMessage.set('Mağazanız henüz onaylanmamış. Onay sonrası ürün ekleyebilirsiniz.');
        } else {
          this.formError.set(msg);
        }
        this.formLoading.set(false);
      },
    });
  }

  deleteProduct(id: number): void {
    this.productService.delete(id).subscribe({ next: () => this.loadProducts() });
  }

  private resetForm(): void {
    this.form = { name: '', description: '', price: null, stock: null };
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
  }
}
