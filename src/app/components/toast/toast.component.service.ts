import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'loading';

export interface ToastState {
  show: boolean;
  message: string;
  type: ToastType;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  public state = signal<ToastState>({ show: false, message: '', type: 'info' });

  public show(message: string, type: ToastType = 'info', duration: number = 3000): void {
    this.state.set({ show: true, message, type });

    if (type !== 'loading' && duration > 0) {
      setTimeout(() => {
        this.hide();
      }, duration);
    }
  }

  public hide(): void {
    this.state.update(current => ({ ...current, show: false }));
  }
}