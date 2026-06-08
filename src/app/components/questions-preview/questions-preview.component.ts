import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestionsService } from '@services/questions/questions.service';

@Component({
  selector: 'app-question-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './questions-preview.component.html',
  styleUrls: ['./questions-preview.component.scss']
})
export class QuestionPreviewComponent implements OnChanges {

  @Input() questionId!: string;
  @Output() close = new EventEmitter<void>();

  private questionsService = inject(QuestionsService);
  private cdr = inject(ChangeDetectorRef);

  public question: any = null;
  public isLoading: boolean = true;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['questionId'] && this.questionId) {
      this.fetchQuestionDetails();
    }
  }

  private fetchQuestionDetails(): void {
    this.isLoading = true;
    this.questionsService.getQuestionById(this.questionId).subscribe({
      next: (res) => {
        this.question = res;
        this.isLoading = false;

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar la cuestión completa:', err);
        this.isLoading = false;

        this.cdr.detectChanges();
      }
    });
  }

  public closePreview(): void {
    this.close.emit();
  }
}