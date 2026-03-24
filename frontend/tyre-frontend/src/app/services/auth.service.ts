import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  is_verified: boolean;
  role: 'admin' | 'customer';
  created_at: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/api/v1`;
  private readonly tokenKey = 'tyre_token';
  private readonly userSubject = new BehaviorSubject<User | null>(null);

  readonly user$ = this.userSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  init(): void {
    const token = this.getToken();
    if (!token) {
      this.userSubject.next(null);
      return;
    }
    this.loadCurrentUser().subscribe({
      next: (user) => this.userSubject.next(user),
      error: () => this.logout(),
    });
  }

  register(payload: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
  }): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.baseUrl}/auth/register`, payload).pipe(
      tap((res) => this.storeToken(res.access_token)),
      tap(() => this.init())
    );
  }

  login(payload: { email: string; password: string }): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.baseUrl}/auth/login`, payload).pipe(
      tap((res) => this.storeToken(res.access_token)),
      tap(() => this.init())
    );
  }

  fetchMe(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/auth/me`);
  }

  loadCurrentUser(): Observable<User> {
    return this.fetchMe().pipe(tap((user) => this.userSubject.next(user)));
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.userSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.userSubject.value;
  }

  isAdmin(): boolean {
    return this.userSubject.value?.role === 'admin';
  }

  get currentUser(): User | null {
    return this.userSubject.value;
  }

  private storeToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }
}
