export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  customerId: number;
  totalAmount: number;
  status: number;
  createdDate: string;
  orderItems: OrderItem[];
}

export const ORDER_STATUS_LABELS: Record<number, string> = {
  1: 'Yeni',
  2: 'İşleniyor',
  3: 'Kargoda',
  4: 'Teslim Edildi',
  5: 'İptal Edildi',
};

export const ORDER_STATUS_CLASSES: Record<number, string> = {
  1: 'bg-gray-100 text-gray-700',
  2: 'bg-blue-50 text-blue-700',
  3: 'bg-amber-50 text-amber-700',
  4: 'bg-green-50 text-green-700',
  5: 'bg-red-50 text-red-600',
};
