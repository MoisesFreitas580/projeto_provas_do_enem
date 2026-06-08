import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface TokenAuth {
  access: string;
  refresh?: string;
}

@Injectable({ providedIn: 'root' })
export class TokenService {
  private platformId = inject(PLATFORM_ID);


  private get storage(): Storage | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const remember = localStorage.getItem('remember_me') === 'true';
    return remember ? localStorage : sessionStorage;
  }

  private get(key: string): string {
    return this.storage?.getItem(key) ?? '';
  }

  private set(key: string, value: string): void {
    this.storage?.setItem(key, value);
  }

  private remove(key: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }


  setRememberMe(value: boolean): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem('remember_me', String(value));
  }

  isRememberMe(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    return localStorage.getItem('remember_me') === 'true';
  }


  getAccess(): string {
    return this.get('access');
  }

  setAccess(token: string): void {
    this.set('access', token);
  }


  getRefresh(): string {
    return this.get('refresh');
  }

  setRefresh(token: string): void {
    this.set('refresh', token);
  }


  setTokens(token: TokenAuth): void {
    this.setAccess(token.access);
    if (token.refresh) this.setRefresh(token.refresh);
  }

  removeTokens(): void {
    ['access', 'refresh', 'user'].forEach(k => this.remove(k));
  }


  decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      // atob não existe no Node — proteção para SSR
      if (typeof atob === 'undefined') return null;
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  isTokenExpired(token: string): boolean {
    if (!token) return true;
    const decoded = this.decodeToken(token);
    if (!decoded?.exp) return true;
    return decoded.exp * 1000 < Date.now();
  }
}