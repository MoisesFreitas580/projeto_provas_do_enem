import { Injectable, signal } from '@angular/core';

export interface ConfirmState {
  show: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {
  // Estado do nosso modal
  public state = signal<ConfirmState>({
    show: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar'
  });

  // Variável para guardar o "resolve" da Promise
  private resolvePromise!: (value: boolean) => void;

  // Função chamada pelos componentes para fazer a pergunta
  public ask(title: string, message: string, confirmText = 'Confirmar', cancelText = 'Cancelar'): Promise<boolean> {
    this.state.set({ show: true, title, message, confirmText, cancelText });
    
    return new Promise((resolve) => {
      this.resolvePromise = resolve;
    });
  }

  public respond(result: boolean): void {
    this.state.update(s => ({ ...s, show: false })); 
    if (this.resolvePromise) {
      this.resolvePromise(result);
    }
  }
}