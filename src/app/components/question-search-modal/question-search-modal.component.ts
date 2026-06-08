import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestionsService } from '@services/questions/questions.service';

@Component({
  selector: 'app-question-search-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './question-search-modal.component.html',
  styleUrls: ['./question-search-modal.component.scss']
})
export class QuestionSearchModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  
  @Output() addSelected = new EventEmitter<string[]>();

  private questionsService = inject(QuestionsService);

  public isLoading: boolean = false;
  public searchResults: any[] = [];
  public selectedQuestions = new Set<string>(); 
  public filters = {
    area: '',
    year: ''
  };

  ngOnInit(): void {
  
    this.searchQuestions();
  }

  public searchQuestions(): void {
    this.isLoading = true;
    
    const params: any = { limit: 50 }; 
    if (this.filters.area) params.area = this.filters.area;
    if (this.filters.year) params.year = this.filters.year;

    this.questionsService.getQuestions(params).subscribe({
      next: (res: any) => {
        // Ajuste conforme o formato de resposta da sua lista de questões
        this.searchResults = res.items || res.data || res;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Erro ao buscar questões:', err);
        this.isLoading = false;
      }
    });
  }

  public toggleSelection(id: string): void {
    if (this.selectedQuestions.has(id)) {
      this.selectedQuestions.delete(id);
    } else {
      this.selectedQuestions.add(id);
    }
  }

  public confirmSelection(): void {
    if (this.selectedQuestions.size === 0) return;
    this.addSelected.emit(Array.from(this.selectedQuestions));
  }
}