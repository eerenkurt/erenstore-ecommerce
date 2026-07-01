import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_BASE_URL } from '../config/api.config';
import { LoginRequest, LoginResponse, RegisterRequest, DecodedToken } from '../models/auth.model';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'eren_store_token';
  private tokenSignal = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));

  readonly isLoggedIn = computed(() => !!this.tokenSignal());
  readonly currentRole = computed(() => {
    const token = this.tokenSignal();
    if (!token) return null;
    return this.decodeToken(token)?.role ?? null;
  });
  readonly currentUserId = computed(() => {
    const token = this.tokenSignal();
    if (!token) return null;
    return this.decodeToken(token)?.nameid ?? null;
  });

  constructor(private http: HttpClient, private router: Router) {}

  login(req: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_BASE_URL}/auth/login`, req).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        this.tokenSignal.set(res.token);
      })
    );
  }

  register(req: RegisterRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${API_BASE_URL}/auth/register`, req);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.tokenSignal.set(null);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  private decodeToken(token: string): DecodedToken | null {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      // .NET JWT uses full claim URIs — normalize
      return {
        nameid: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ?? decoded.nameid ?? decoded.sub,
        email: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ?? decoded.email,
        role: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? decoded.role,
        exp: decoded.exp,
      };
    } catch {
      return null;
    }
  }
}
