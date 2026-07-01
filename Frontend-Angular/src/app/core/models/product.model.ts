export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  sellerId: number;
  description?: string;
}

export interface CreateProductRequest {
  name: string;
  price: number;
  stock: number;
  description?: string;
}

export interface UpdateProductRequest {
  id: number;
  name: string;
  price: number;
  stock: number;
  description?: string;
}
