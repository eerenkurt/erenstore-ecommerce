import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { PendingSeller, ApproveSellerRequest } from '../models/admin.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private http: HttpClient) {}

  getPendingSellers(): Observable<PendingSeller[]> {
    return this.http.get<PendingSeller[]>(`${API_BASE_URL}/admin/pending-sellers`);
  }

  approveSeller(req: ApproveSellerRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${API_BASE_URL}/admin/approve-seller`, req);
  }
}
