import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestionsService } from '@services/questions/questions.service';

@Component({
  selector: 'app-question-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './questions-preview.component.html',
  styleUrls: ['./questions-preview.component.scss'],
})
export class QuestionPreviewComponent implements OnChanges {
  @Input() questionId!: string;
  @Output() close = new EventEmitter<void>();

  private questionsService = inject(QuestionsService);
  private cdr = inject(ChangeDetectorRef);

  public question: any = null;
  public isLoading = true;
  public hasError  = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['questionId'] && this.questionId) {
      this.fetchQuestionDetails();
    }
  }

  private fetchQuestionDetails(): void {
    this.isLoading = true;
    this.hasError  = false;
    this.question  = null;

    this.questionsService.getQuestionById(this.questionId).subscribe({
      next: (res) => {
        this.question  = res;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar a questão:', err);
        this.hasError  = true;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  public closePreview(): void {
    this.close.emit();
  }

  public isSupportText(block: any): boolean {
    return block.type === 'TEXT' && block.text !== this.question?.rawJson?.comando;
  }
}