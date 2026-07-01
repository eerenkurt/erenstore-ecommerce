import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-product-placeholder',
  standalone: true,
  template: `
    <div class="w-full aspect-square bg-gray-50 flex items-center justify-center border border-gray-100 rounded-lg">
      <span class="text-4xl font-light text-gray-300 uppercase select-none">{{ initial }}</span>
    </div>
  `,
})
export class ProductPlaceholderComponent {
  @Input() name = '';
  get initial(): string { return this.name.charAt(0) || '?'; }
}
