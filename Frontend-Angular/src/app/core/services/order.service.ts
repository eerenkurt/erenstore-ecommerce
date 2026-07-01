import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { Order } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private http: HttpClient) {}

  placeOrder(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${API_BASE_URL}/orders`, {});
  }

  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${API_BASE_URL}/orders/my-orders`);
  }

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${API_BASE_URL}/orders/all-orders`);
  }

  updateOrderStatus(id: number, status: number): Observable<any> {
    return this.http.put(`${API_BASE_URL}/orders/${id}/status`, { status });
  }
}
