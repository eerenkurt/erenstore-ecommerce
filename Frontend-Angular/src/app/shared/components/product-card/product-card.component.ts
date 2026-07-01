import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { ProductPlaceholderComponent } from '../product-placeholder/product-placeholder.component';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, ProductPlaceholderComponent],
  template: `
    <div class="group border border-gray-100 rounded-xl overflow-hidden hover:shadow-sm transition-shadow bg-white">
      <a [routerLink]="['/urun', product.id]" class="block">
        <app-product-placeholder [name]="product.name" />
        <div class="p-4">
          <p class="text-xs text-gray-400 mb-1">{{ product.stock > 0 ? 'Stokta var' : 'Tükendi' }}</p>
          <h3 class="text-sm font-medium text-gray-900 leading-snug">{{ product.name }}</h3>
          <p class="mt-2 text-base font-semibold text-gray-900">{{ formatPrice(product.price) }}</p>
        </div>
      </a>
      @if (showAddToCart && product.stock > 0) {
        <div class="px-4 pb-4">
          <button
            (click)="addToCart.emit(product)"
            class="w-full py-2 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Sepete Ekle
          </button>
        </div>
      }
    </div>
  `,
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Input() showAddToCart = false;
  @Output() addToCart = new EventEmitter<Product>();

  formatPrice(price: number): string {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
  }
}
