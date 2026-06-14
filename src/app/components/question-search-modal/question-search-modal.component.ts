import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestionsService } from '@services/questions/questions.service';
import { QuestionPreviewComponent } from '@components/questions-preview/questions-preview.component';

@Component({
  selector: 'app-question-search-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, QuestionPreviewComponent],
  templateUrl: './question-search-modal.component.html',
  styleUrls: ['./question-search-modal.component.scss'],
})
export class QuestionSearchModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() addSelected = new EventEmitter<string[]>();

  private questionsService = inject(QuestionsService);

  public isLoading = false;
  public searchResults: any[] = [];
  public selectedQuestions = new Set<string>();
  public previewId: string | null = null;
  private cdr = inject(ChangeDetectorRef)

  public filters = {
    area: '',
    year: '' as string | number,
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
        this.searchResults = res.data || res.items || (Array.isArray(res) ? res : []);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erro ao buscar questões:', err);
        this.searchResults = [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  public toggleSelection(id: string): void {
    this.selectedQuestions.has(id) ? this.selectedQuestions.delete(id) : this.selectedQuestions.add(id);
  }

  public openPreview(id: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.previewId = id;
  }

  public confirmSelection(): void {
    if (this.selectedQuestions.size === 0) return;
    this.addSelected.emit(Array.from(this.selectedQuestions));
  }

  public getSnippet(q: any): string {
    const text: string = q.rawJson?.comando || '';
    if (!text) return 'Questão sem enunciado mapeado.';
    return text.length > 150 ? text.slice(0, 150) + '…' : text;
  }
}