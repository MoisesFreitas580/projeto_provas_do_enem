import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestionSearchModalComponent } from '../question-search-modal/question-search-modal.component'; // 🌟 Ajuste o caminho se necessário!

@Component({
  selector: 'app-manual-exam-form',
  standalone: true,
  imports: [CommonModule, QuestionSearchModalComponent],
  template: `
    <div class="manual-form-container">
      
      <div class="header-action">
        <div class="info">
          <span class="material-symbols-outlined">format_list_bulleted</span>
          <span class="text">{{ selectedQuestions.length }} questão(ões) selecionada(s)</span>
        </div>
        <button type="button" class="btn-secondary" (click)="openSearch()">
          <span class="material-symbols-outlined">search</span> Buscar Questões
        </button>
      </div>

      @if (selectedQuestions.length > 0) {
        <div class="selected-list">
          @for (id of selectedQuestions; track id) {
            <div class="selected-item">
              <span class="q-id">ID: {{ id | slice:0:8 }}...</span>
              <button type="button" class="btn-remove" (click)="removeQuestion(id)" title="Remover">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
          }
        </div>
      } @else {
        <div class="empty-state-mini">
          <p>Nenhuma questão selecionada. Clique em "Buscar Questões" para adicionar.</p>
        </div>
      }
    </div>

    @if (isSearchModalOpen) {
      <app-question-search-modal
        (close)="closeSearch()"
        (addSelected)="onQuestionsAdded($event)">
      </app-question-search-modal>
    }
  `,
  styles: [`
    .manual-form-container { margin-top: 16px; }
    
    .header-action { 
      display: flex; justify-content: space-between; align-items: center; 
      margin-bottom: 16px; background: #f8fafc; padding: 12px; 
      border-radius: 8px; border: 1px solid #e2e8f0; 
    }
    
    .info { display: flex; align-items: center; gap: 8px; font-weight: 600; color: #0f766e; }
    
    .btn-secondary { 
      display: flex; align-items: center; gap: 6px; background: white; 
      border: 1px solid #cbd5e1; padding: 8px 12px; border-radius: 6px; 
      cursor: pointer; font-size: 13px; font-weight: 600; transition: 0.2s; 
    }
    .btn-secondary:hover { background: #f1f5f9; border-color: #94a3b8; }
    
    .selected-list { 
      display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); 
      gap: 8px; max-height: 150px; overflow-y: auto; padding-right: 4px; 
    }
    
    .selected-item { 
      display: flex; justify-content: space-between; align-items: center; 
      background: #f0fdf4; border: 1px solid #bbf7d0; padding: 6px 10px; 
      border-radius: 6px; font-size: 13px; color: #166534; 
    }
    
    .btn-remove { 
      background: transparent; border: none; color: #166534; cursor: pointer; 
      display: flex; align-items: center; justify-content: center; padding: 2px; 
      border-radius: 4px; transition: 0.2s; 
    }
    .btn-remove:hover { background: #dcfce7; color: #dc2626; }
    
    .empty-state-mini { 
      text-align: center; padding: 20px; border: 1px dashed #cbd5e1; 
      border-radius: 8px; color: #64748b; font-size: 13px; 
    }
  `]
})
export class ManualExamFormComponent implements OnInit {
  @Output() payloadChange = new EventEmitter<any>();

  public selectedQuestions: string[] = [];
  public isSearchModalOpen: boolean = false;

  ngOnInit() {
    this.emitPayload();
  }

  public openSearch(): void {
    this.isSearchModalOpen = true;
  }

  public closeSearch(): void {
    this.isSearchModalOpen = false;
  }

  public onQuestionsAdded(newIds: string[]): void {
    const mergedSet = new Set([...this.selectedQuestions, ...newIds]);
    this.selectedQuestions = Array.from(mergedSet);
    
    this.closeSearch();
    this.emitPayload();
  }

  public removeQuestion(idToRemove: string): void {
    this.selectedQuestions = this.selectedQuestions.filter(id => id !== idToRemove);
    this.emitPayload();
  }

  public emitPayload(): void {
    this.payloadChange.emit({
      questionIds: this.selectedQuestions,
      filters: {}
    });
  }
}