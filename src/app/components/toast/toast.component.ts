import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.component.service'; // Ajuste o caminho

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (toastService.state().show) {
      <div class="toast-container" [ngClass]="toastService.state().type">
        
        <div class="toast-icon">
          @if (toastService.state().type === 'loading') {
            <span class="material-icons spinner">sync</span>
          } @else if (toastService.state().type === 'success') {
            <span class="material-icons">check_circle</span>
          } @else if (toastService.state().type === 'error') {
            <span class="material-icons">error</span>
          } @else {
            <span class="material-icons">info</span>
          }
        </div>

        <span class="toast-message">{{ toastService.state().message }}</span>

        @if (toastService.state().type !== 'loading') {
          <button class="btn-close" (click)="toastService.hide()">
            <span class="material-icons">close</span>
          </button>
        }
      </div>
    }
  `,
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent {
  public toastService = inject(ToastService);
}