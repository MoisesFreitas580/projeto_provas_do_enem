import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmService } from './confirm.component.service'; // Ajuste o caminho

@Component({
  selector: 'app-confirm',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (confirmService.state().show) {
      <div class="modal-overlay" (click)="confirmService.respond(false)">
        
        <div class="confirm-dialog" (click)="$event.stopPropagation()">
          
          <div class="confirm-header">
            <div class="icon-wrap">
              <span class="material-icons">help_outline</span>
            </div>
            <h3>{{ confirmService.state().title }}</h3>
          </div>
          
          <div class="confirm-body">
            <p>{{ confirmService.state().message }}</p>
          </div>
          
          <div class="confirm-footer">
            <button class="btn-cancel" (click)="confirmService.respond(false)">
              {{ confirmService.state().cancelText }}
            </button>
            <button class="btn-confirm" (click)="confirmService.respond(true)">
              {{ confirmService.state().confirmText }}
            </button>
          </div>
          
        </div>
      </div>
    }
  `,
  styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponent {
  public confirmService = inject(ConfirmService);
}