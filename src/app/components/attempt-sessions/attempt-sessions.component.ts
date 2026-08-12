import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AttemptSessionsService } from '@services/attempt-sessions/attempt-sessions.service';
import { from, concatMap, toArray, finalize } from 'rxjs';
import { ToastService } from '@components/toast/toast.component.service';
import { ConfirmService } from '@components/confirm/confirm.component.service';

interface QuestionState {
  isSeen: boolean;
  selectedAlternativeId: string | null;
  timeSpentMs: number;
  entryTime: number | null;
}

/** Deve bater com o `data` configurado em app.routes.ts para cada variação de sessão. */
export interface AttemptSessionRouteData {
  idParam: string;
  defaultTitle: string;
  finishLabel: string;
}

@Component({
  selector: 'app-attempt-session',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attempt-sessions.component.html',
  styleUrls: ['./attempt-sessions.component.scss']
})
export class AttemptSessionComponent implements OnInit, OnDestroy {
  private route           = inject(ActivatedRoute);
  private router          = inject(Router);
  private attemptService  = inject(AttemptSessionsService);
  private cdr             = inject(ChangeDetectorRef);
  private toastService    = inject(ToastService);
  private confirmService  = inject(ConfirmService);

  public sessionId: string    = '';
  public sessionTitle: string = '';
  public finishLabel: string  = 'Concluir';

  public questions: any[] = [];
  public currentQuestionIndex: number = 0;

  public isLoading: boolean    = true;
  public isSubmitting: boolean = false;

  public answersCache: Record<string, QuestionState> = {};

  ngOnInit(): void {
    const data    = this.route.snapshot.data as Partial<AttemptSessionRouteData>;
    const idParam = data['idParam'] || 'sessionId';

    this.sessionId    = this.route.snapshot.paramMap.get(idParam) || '';
    this.sessionTitle = data['defaultTitle'] || 'Sessão de Treino';
    this.finishLabel  = data['finishLabel'] || 'Concluir';

    if (this.sessionId) this.loadSession();
  }

  ngOnDestroy(): void {
    this.stopTimer(this.currentQuestionId);
  }

  get currentQuestion() { return this.questions[this.currentQuestionIndex]; }
  get currentQuestionId() { return this.currentQuestion?.id; }

  private loadSession(): void {
    this.isLoading = true;
    this.attemptService.getSessionById(this.sessionId).subscribe({
      next: (res: any) => {
        if (res?.title) this.sessionTitle = res.title;

        if (res && res.answers) {
          this.questions = res.answers.map((ans: any) => ans.question);

          res.answers.forEach((ans: any) => {
            this.answersCache[ans.questionId] = {
              isSeen: ans.timeSpentMs > 0 || !!ans.selectedAlternativeId,
              selectedAlternativeId: ans.selectedAlternativeId || null,
              timeSpentMs: ans.timeSpentMs || 0,
              entryTime: null
            };
          });
        } else {
          this.questions = [];
        }

        this.isLoading = false;
        this.startTimer(this.currentQuestionId);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar sessão', err);
        this.toastService.show('Erro ao carregar a sessão. Tente novamente.', 'error');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  public goToQuestion(index: number): void {
    if (index < 0 || index >= this.questions.length) return;
    this.stopTimer(this.currentQuestionId);
    this.currentQuestionIndex = index;
    this.startTimer(this.currentQuestionId);
    this.cdr.detectChanges();
  }

  private startTimer(questionId: string): void {
    if (!questionId || !this.answersCache[questionId]) return;
    this.answersCache[questionId].isSeen = true;
    this.answersCache[questionId].entryTime = Date.now();
  }

  private stopTimer(questionId: string): void {
    if (!questionId || !this.answersCache[questionId]) return;
    const cache = this.answersCache[questionId];
    if (cache.entryTime) {
      cache.timeSpentMs += (Date.now() - cache.entryTime);
      cache.entryTime = null;
    }
  }

  public selectAlternative(altId: string): void {
    this.answersCache[this.currentQuestionId].selectedAlternativeId = altId;
    this.cdr.detectChanges();
  }

  public async finishSession(): Promise<void> {
    const confirmed = await this.confirmService.ask(
      'Concluir Sessão',
      'Tem certeza que deseja concluir? As questões não respondidas serão consideradas puladas.',
      'Sim, Concluir',
      'Voltar'
    );
    if (!confirmed) return;

    this.toastService.show('A processar as suas respostas e a corrigir a sessão...', 'loading');

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
      return this.attemptService.answerQuestion(this.sessionId, q.id, payload);
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
        this.toastService.show('Erro ao enviar respostas. Tente novamente.', 'error');
      }
    });
  }

  private correctAndFinish(): void {
    this.isSubmitting = true;
    this.cdr.detectChanges();

    this.attemptService.correctSession(this.sessionId).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.toastService.show('Sessão corrigida com sucesso!', 'success');
        // TODO: navegar para uma página de resultados quando ela existir (ex: /resultados/:id)
        this.router.navigate(['/']);
      },
      error: () => {
        this.isSubmitting = false;
        this.toastService.show('Ocorreu um erro na correção.', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  public async abandonSession(): Promise<void> {
    const confirmed = await this.confirmService.ask(
      'Abandonar Sessão',
      'Se abandonar, o progresso será encerrado sem correção. Deseja sair?',
      'Sim, Abandonar',
      'Cancelar'
    );
    if (!confirmed) return;

    this.attemptService.abandonSession(this.sessionId).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => this.toastService.show('Erro ao abandonar sessão.', 'error')
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