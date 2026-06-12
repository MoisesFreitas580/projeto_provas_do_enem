import { Component, OnInit, inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AttemptSessionsService } from '@services/attempt-sessions/attempt-sessions.service';
import { from, concatMap, toArray, finalize } from 'rxjs';

interface QuestionState {
  isSeen: boolean;
  selectedAlternativeId: string | null;
  timeSpentMs: number;
  entryTime: number | null;
}

@Component({
  selector: 'app-attempt-session-avulso',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attempt-sessions-avulso.component.html',
  styleUrls: ['./attempt-sessions-avulso.component.scss']
})
export class AttemptSessionAvulsoComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private attemptService = inject(AttemptSessionsService);
  private cdr = inject(ChangeDetectorRef);

  public avulsoId: string = '';
  public sessionTitle: string = 'Simulado Personalizado';

  public questions: any[] = [];
  public currentQuestionIndex: number = 0;

  public isLoading: boolean = true;
  public isSubmitting: boolean = false;

  public answersCache: Record<string, QuestionState> = {};

  ngOnInit() {
    this.avulsoId = this.route.snapshot.paramMap.get('avulsoId') || '';
    if (this.avulsoId) {
      this.loadSession();
    }
  }

  ngOnDestroy() {
    this.stopTimer(this.currentQuestionId);
  }

  get currentQuestion() { return this.questions[this.currentQuestionIndex]; }
  get currentQuestionId() { return this.currentQuestion?.id; }

  private loadSession() {
    this.isLoading = true;
    this.attemptService.getSessionById(this.avulsoId).subscribe({
      next: (res: any) => {
        if (res && res.answers) {
          if (res.title) this.sessionTitle = res.title;

          this.questions = res.answers.map((ans: any) => ans.question);

          res.answers.forEach((ans: any) => {
            this.answersCache[ans.questionId] = {
              isSeen: ans.timeSpentMs > 0 || !!ans.selectedAlternativeId,
              selectedAlternativeId: ans.selectedAlternativeId || null,
              timeSpentMs: ans.timeSpentMs || 0,
              entryTime: null
            };
          });
        }

        this.isLoading = false;
        this.startTimer(this.currentQuestionId);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar sessão', err);
        alert('Erro ao carregar o simulado. Tente novamente.');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  public goToQuestion(index: number) {
    if (index < 0 || index >= this.questions.length) return;
    this.stopTimer(this.currentQuestionId);
    this.currentQuestionIndex = index;
    this.startTimer(this.currentQuestionId);
    this.cdr.detectChanges();
  }

  private startTimer(questionId: string) {
    if (!questionId || !this.answersCache[questionId]) return;
    this.answersCache[questionId].isSeen = true;
    this.answersCache[questionId].entryTime = Date.now();
  }

  private stopTimer(questionId: string) {
    if (!questionId || !this.answersCache[questionId]) return;
    const cache = this.answersCache[questionId];
    if (cache.entryTime) {
      cache.timeSpentMs += (Date.now() - cache.entryTime);
      cache.entryTime = null;
    }
  }

  public selectAlternative(altId: string) {
    this.answersCache[this.currentQuestionId].selectedAlternativeId = altId;
    this.cdr.detectChanges();
  }

  public finishSession() {
    if (!confirm('Tem certeza que deseja concluir o simulado? As questões não respondidas serão consideradas puladas.')) return;

    this.isSubmitting = true;
    this.stopTimer(this.currentQuestionId);
    this.cdr.detectChanges();

    const requests = this.questions.map(q => {
      const state = this.answersCache[q.id];
      const payload = {
        selectedAlternativeId: state.selectedAlternativeId,
        isSkipped: !state.selectedAlternativeId,
        timeSpentMs: state.timeSpentMs,
        reviewCount: 1,
        confidenceLevel: 3
      };
      return this.attemptService.answerQuestion(this.avulsoId, q.id, payload);
    });

    from(requests).pipe(
      concatMap(req => req),
      toArray(),
      finalize(() => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => this.correctAndFinish(),
      error: (err) => {
        console.error('Erro ao salvar respostas em lote', err);
        alert('Erro ao enviar respostas. Tente novamente.');
      }
    });
  }

  private correctAndFinish() {
    this.isSubmitting = true;
    this.cdr.detectChanges();

    this.attemptService.correctSession(this.avulsoId).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.router.navigate(['/']);
      },
      error: () => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  public abandonSession() {
    if (!confirm('Se abandonar, o progresso não será corrigido. Deseja sair?')) return;

    this.attemptService.abandonSession(this.avulsoId).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => alert('Erro ao abandonar sessão.')
    });
  }

  public getQuestionStatusClass(qId: string): string {
    const state = this.answersCache[qId];
    if (!state) return 'unseen';
    if (state.selectedAlternativeId) return 'answered';
    if (state.isSeen) return 'seen';
    return 'unseen';
  }
}