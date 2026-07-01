import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { Cart } from '../models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  constructor(private http: HttpClient) {}

  getCart(): Observable<Cart> {
    return this.http.get<Cart>(`${API_BASE_URL}/cart`);
  }

  addItem(productId: number, quantity: number): Observable<any> {
    return this.http.post(`${API_BASE_URL}/cart`, { productId, quantity });
  }

  updateItem(id: number, quantity: number): Observable<any> {
    return this.http.put(`${API_BASE_URL}/cart/${id}`, { quantity });
  }

  removeItem(id: number): Observable<any> {
    return this.http.delete(`${API_BASE_URL}/cart/${id}`);
  }
}
