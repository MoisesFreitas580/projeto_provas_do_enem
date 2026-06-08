import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-random-exam-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="form-grid">
      <div class="form-group">
        <label>Quantidade de Questões</label>
        <input 
          type="number" 
          [(ngModel)]="quantity" 
          (ngModelChange)="emitPayload()" 
          min="5" 
          max="90" 
          placeholder="Ex: 10"
        >
      </div>
      
      <div class="form-group">
        <label>Área de Conhecimento (Opcional)</label>
        <select [(ngModel)]="areaCode" (ngModelChange)="emitPayload()">
          <option value="">Todas as Áreas (Misto)</option>
          <option value="LC">Linguagens e Códigos (LC)</option>
          <option value="CH">Ciências Humanas (CH)</option>
          <option value="CN">Ciências da Natureza (CN)</option>
          <option value="MT">Matemática (MT)</option>
        </select>
      </div>
    </div>
  `,
  styles: [`
    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 8px; }
    label { font-size: 13px; font-weight: 600; color: #64748b; }
    input, select { padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; font-family: inherit; font-size: 14px; transition: 0.2s; }
    input:focus, select:focus { outline: none; border-color: #0f766e; box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.1); }
  `]
})
export class RandomExamFormComponent implements OnInit {
  @Output() payloadChange = new EventEmitter<any>();

  public quantity: number = 10;
  public areaCode: string = '';

  ngOnInit() {
    this.emitPayload(); 
  }

  public emitPayload() {
    
    const payload: any = {
      quantity: Number(this.quantity),
      filters: {}
    };

   
    if (this.areaCode) {
      payload.filters.areaCode = this.areaCode;
    }

    this.payloadChange.emit(payload);
  }
}