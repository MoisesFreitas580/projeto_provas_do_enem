import { Component, OnInit, inject, signal } from '@angular/core';
import { LowerCasePipe, CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionPreviewComponent } from '@components/questions-preview/questions-preview.component';
import { AttemptSessionsService } from '@services/attempt-sessions/attempt-sessions.service';
import { AttemptSessionResult } from '@models/attempt-result.model';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [
    CommonModule,
    LowerCasePipe,
    QuestionPreviewComponent
  ],
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private attemptSessionsService = inject(AttemptSessionsService);

  sessionId = signal<string | null>(null);
  resultData = signal<AttemptSessionResult | null>(null);
  isLoading = signal<boolean>(true);
  hasError = signal<boolean>(false);

  selectedQuestion = signal<any>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('sessionId');
    this.sessionId.set(id);

    if (id) {
      this.carregarResultado(id);
    } else {
      this.isLoading.set(false);
      this.hasError.set(true);
    }
  }

  carregarResultado(id: string): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.attemptSessionsService.getSessionById(id).subscribe({
      next: (data: any) => {
        this.resultData.set(data?.data ? data.data : data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar resultado:', err);
        this.isLoading.set(false);
        this.hasError.set(true);
      }
    });
  }

  abrirPreview(question: any): void {
    this.selectedQuestion.set(question);
  }

  fecharPreview(): void {
    this.selectedQuestion.set(null);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}