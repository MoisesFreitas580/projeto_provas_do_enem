import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '@environments/environments';
import { TokenService } from './token.service';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserData {
  id: string | number;
  name: string;
  email: string;
  role?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private $http = inject(HttpClient);
  private $token = inject(TokenService);
  private $router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private api = environment.api;


  is_logged = signal<boolean>(this.checkInitialAuth());
  currentUser = signal<UserData | null>(this.getInitialUser());

  userName = computed(() => this.currentUser()?.name ?? '');


  login(credentials: LoginCredentials, rememberMe = false): Observable<any> {
    this.$token.setRememberMe(rememberMe);

    return this.$http.post<any>(`${this.api}auth/login`, credentials).pipe(
      tap((response) => {
        const access = response.accessToken ?? response.access_token ?? response.token;
        const refresh = response.refreshToken ?? response.refresh_token;

        this.$token.setTokens({ access, refresh });

        const user: UserData = response.user ?? response.data?.user ?? null;
        if (user) {
          this.persistUser(user);
          this.currentUser.set(user);
        }

        this.is_logged.set(true);
      })
    );
  }


  logout(): void {
    this.$token.removeTokens();
    this.is_logged.set(false);
    this.currentUser.set(null);
    this.$router.navigateByUrl('/login');
  }


  isAuthenticated(): 'access' | 'expired' | 'not_allowed' {
    const token = this.$token.getAccess();

    if (!token) return 'not_allowed';
    if (this.$token.isTokenExpired(token)) return 'expired';

    return 'access';
  }


  getUserData(): UserData | null {
    return this.currentUser();
  }


  private persistUser(user: UserData): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const storage = this.$token.isRememberMe() ? localStorage : sessionStorage;
    storage.setItem('user', JSON.stringify(user));
  }

  private checkInitialAuth(): boolean {
    const token = this.$token.getAccess();
    return !!token && !this.$token.isTokenExpired(token);
  }

  private getInitialUser(): UserData | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const raw = localStorage.getItem('user') ?? sessionStorage.getItem('user');
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}