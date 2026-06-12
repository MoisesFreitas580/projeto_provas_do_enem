import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestionsService } from '@services/questions/questions.service';
import { QuestionPreviewComponent } from '@components/questions-preview/questions-preview.component';

@Component({
  selector: 'app-manual-exam-form',
  standalone: true,
  imports: [CommonModule, FormsModule, QuestionPreviewComponent],
  templateUrl: './manual-exam-form.component.html',
  styleUrls: ['./manual-exam-form.component.scss'],
})
export class ManualExamFormComponent {
  @Output() payloadChange = new EventEmitter<any>();

  private questionsService = inject(QuestionsService);

  public selectedIds: Set<string> = new Set();
  public searchResults:  any[] = [];
  public isSearching   = false;
  public previewId:    string | null = null;

  public searchArea  = '';
  public searchYear: number | null = null;

  public search(): void {
    this.isSearching = true;
    const params: any = { limit: 40 };
    if (this.searchArea) params.area = this.searchArea;
    if (this.searchYear) params.year = this.searchYear;

    this.questionsService.getQuestions(params).subscribe({
      next: (res: any) => {
        this.searchResults = res.data || res.items || [];
        this.isSearching = false;
      },
      error: () => { this.isSearching = false; },
    });
  }

  public toggle(id: string): void {
    this.selectedIds.has(id) ? this.selectedIds.delete(id) : this.selectedIds.add(id);
    this.emit();
  }

  public removeById(id: string): void {
    this.selectedIds.delete(id);
    this.emit();
  }

  public openPreview(id: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.previewId = id;
  }

  private emit(): void {
    this.payloadChange.emit({
      filters: {},
      questionIds: Array.from(this.selectedIds),
    });
  }

  get selectedIdsArray(): string[] { return Array.from(this.selectedIds); }
}