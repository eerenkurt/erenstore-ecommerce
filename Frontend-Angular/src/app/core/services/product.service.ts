import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { Product, CreateProductRequest, UpdateProductRequest } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(`${API_BASE_URL}/products`);
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${API_BASE_URL}/products/${id}`);
  }

  getMyProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${API_BASE_URL}/products/my-products`);
  }

  create(req: CreateProductRequest): Observable<{ message: string; data: Product }> {
    return this.http.post<{ message: string; data: Product }>(`${API_BASE_URL}/products`, req);
  }

  update(req: UpdateProductRequest): Observable<any> {
    return this.http.put(`${API_BASE_URL}/products`, req);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${API_BASE_URL}/products/${id}`);
  }
}
