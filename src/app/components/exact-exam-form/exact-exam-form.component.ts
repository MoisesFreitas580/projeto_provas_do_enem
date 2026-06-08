import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-exact-exam-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="form-grid">
      <div class="form-group">
        <label>Tipo de Prova</label>
        <select [(ngModel)]="examType" (ngModelChange)="emitPayload()">
          <option value="REGULAR">Regular</option>
          <option value="PPL">PPL (Prisional)</option>
        </select>
      </div>
      
      <div class="form-group">
        <label>Ano</label>
        <input type="number" [(ngModel)]="examYear" (ngModelChange)="emitPayload()" placeholder="Ex: 2015">
      </div>
      
      <div class="form-group">
        <label>Dia de Aplicação</label>
        <select [(ngModel)]="examDay" (ngModelChange)="emitPayload()">
          <option value="D1">Dia 1 (Linguagens e Humanas)</option>
          <option value="D2">Dia 2 (Matemática e Natureza)</option>
        </select>
      </div>
    </div>
  `,
  styles: [`
    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-top: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 8px; }
    label { font-size: 13px; font-weight: 600; color: #64748b; }
    input, select { padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; font-family: inherit; font-size: 14px; transition: 0.2s; }
    input:focus, select:focus { outline: none; border-color: #0f766e; box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.1); }
  `]
})
export class ExactExamFormComponent implements OnInit {
  
  @Output() payloadChange = new EventEmitter<any>();

  public examType: string = 'PPL';
  public examYear: number = 2015;
  public examDay: string = 'D1';

  ngOnInit() {
    this.emitPayload();
  }

  public emitPayload() {
    this.payloadChange.emit({
      filters: {
        type: this.examType,
        year: Number(this.examYear),
        day: this.examDay
      }
    });
  }
}