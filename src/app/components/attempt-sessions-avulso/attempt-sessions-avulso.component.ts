import { Component, OnInit, inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AttemptSessionsService } from '@services/attempt-sessions/attempt-sessions.service';
import { ToastService } from '@components/toast/toast.component.service'; // 🌟 Importação do Toast
import { from, concatMap, toArray, finalize } from 'rxjs';
import { ConfirmService } from '@components/confirm/confirm.component.service';

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
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);

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
        this.toastService.show('Erro ao carregar o simulado. Tente novamente.', 'error'); // 🌟 Toast
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

  public async finishSession() {
    const confirmed = await this.confirmService.ask(
      'Concluir Simulado',
      'Tem certeza que deseja concluir o simulado? As questões não respondidas serão consideradas puladas.',
      'Sim, Concluir',
      'Voltar à prova'
    );

    if (!confirmed) return;

    this.toastService.show('A guardar as suas respostas e a corrigir o simulado...', 'loading');

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
        this.toastService.show('Erro ao enviar respostas. Tente novamente.', 'error'); // 🌟 Toast Error
      }
    });
  }

  private correctAndFinish() {
    this.isSubmitting = true;
    this.cdr.detectChanges();

    this.attemptService.correctSession(this.avulsoId).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.toastService.show('Simulado corrigido com sucesso!', 'success'); // 🌟 Toast Success
        this.router.navigate(['/']);
      },
      error: () => {
        this.isSubmitting = false;
        this.toastService.show('Ocorreu um erro na correção.', 'error'); // 🌟 Toast Error
        this.cdr.detectChanges();
      }
    });
  }

  public async abandonSession() {
    const confirmed = await this.confirmService.ask(
      'Abandonar Simulado',
      'Se abandonar, o progresso do simulado será encerrado sem correção. Deseja sair?',
      'Sim, Abandonar',
      'Cancelar'
    );

    if (!confirmed) return;

    this.attemptService.abandonSession(this.avulsoId).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => this.toastService.show('Erro ao abandonar sessão.', 'error') // 🌟 Toast Error
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