import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SimulationsService } from '@services/simulations/simulations.service';
import { AttemptSessionsService } from '@services/attempt-sessions/attempt-sessions.service';
import { QuestionPreviewComponent } from '@components/questions-preview/questions-preview.component';
import { QuestionSearchModalComponent } from '@components/question-search-modal/question-search-modal.component';
import { ToastService } from '@components/toast/toast.component.service';
import { ConfirmService } from '@components/confirm/confirm.component.service';

@Component({
  selector: 'app-simulations-details',
  templateUrl: './simulations-details.component.html',
  styleUrls: ['./simulations-details.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, QuestionPreviewComponent, QuestionSearchModalComponent],
})
export class SimulationsDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private simulationsService = inject(SimulationsService);
  private attemptService = inject(AttemptSessionsService);
  private cdr = inject(ChangeDetectorRef);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);

  public isLoading = true;
  public isStartingSession = false;
  public simulationId: string | null = null;

  public simulationDetails: any = null;
  public questions: any[] = [];

  public isEditingTitle = false;
  public editTitleValue = '';
  public isSavingTitle = false;

  public selectedQuestions = new Set<string>();

  public isPreviewModalOpen = false;
  public previewQuestionId = '';
  public isSearchModalOpen = false;

  ngOnInit(): void {
    this.simulationId = this.route.snapshot.paramMap.get('simulationId');
    if (this.simulationId) this.fetchQuestions();
  }


  private fetchQuestions(): void {
    this.isLoading = true;
    this.simulationsService.getSimulationById(this.simulationId!).subscribe({
      next: (res: any) => {
        this.simulationDetails = res.simulation || res.data?.simulation || res;
      },
    });
    this.simulationsService.getSimulationQuestions(this.simulationId!).subscribe({
      next: (res: any) => {
        this.questions = res.questions || res.items || res.data?.questions || [];
        this.editTitleValue = this.simulationDetails?.title || '';
        this.selectedQuestions.clear();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastService.show('Erro ao carregar os detalhes do simulado.', 'error');
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }


  public startEditingTitle(): void {
    this.editTitleValue = this.simulationDetails?.title || '';
    this.isEditingTitle = true;
  }

  public cancelEditingTitle(): void {
    this.isEditingTitle = false;
    this.editTitleValue = this.simulationDetails?.title || '';
  }

  public saveTitle(): void {
    const value = this.editTitleValue.trim();
    if (!value || this.isSavingTitle) return;

    this.isSavingTitle = true;
    this.simulationsService.updateSimulationTitle(this.simulationId!, value).subscribe({
      next: () => {
        this.simulationDetails.title = value;
        this.isEditingTitle = false;
        this.isSavingTitle = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastService.show('Erro ao atualizar o título.', 'error');
        this.isSavingTitle = false;
        this.cdr.detectChanges();
      },
    });
  }


  public getQuestionId(item: any): string {
    return item.question?.id || item.id;
  }

  public toggleSelection(questionId: string): void {
    this.selectedQuestions.has(questionId)
      ? this.selectedQuestions.delete(questionId)
      : this.selectedQuestions.add(questionId);
  }

  public toggleAll(): void {
    if (this.isAllSelected()) {
      this.selectedQuestions.clear();
    } else {
      this.questions.forEach(q => this.selectedQuestions.add(this.getQuestionId(q)));
    }
  }

  public isAllSelected(): boolean {
    return this.questions.length > 0 && this.selectedQuestions.size === this.questions.length;
  }


  public startSelectedPractice(): void {
    if (this.selectedQuestions.size === 0 || this.isStartingSession) return;

    this.isStartingSession = true;
    const payload = {
      title: `Treino: ${this.simulationDetails?.title || 'Personalizado'}`,
      questionIds: Array.from(this.selectedQuestions),
    };

    this.attemptService.createAvulsoSession(payload).subscribe({
      next: (res) => {
        this.isStartingSession = false;
        this.router.navigate(['/attempt-sessions-avulso', res.id]);
      },
      error: (err) => {
        console.error('Erro ao iniciar treino avulso:', err);
        this.toastService.show('Erro ao preparar o simulado. Tente novamente.', 'error');
        this.isStartingSession = false;
        this.cdr.detectChanges();
      },
    });
  }


  public async removeQuestion(questionId: string, event: Event): Promise<void> {
    event.stopPropagation();
    event.preventDefault();

    const confirmed = await this.confirmService.ask(
      'Remover Questão',
      'Deseja realmente remover esta questão do simulado?',
      'Sim, Remover',
      'Cancelar'
    );
    if (!confirmed) return;

    this.simulationsService.removeQuestionFromSimulation(this.simulationId!, questionId).subscribe({
      next: () => {
        this.questions = this.questions.filter(q => this.getQuestionId(q) !== questionId);
        this.selectedQuestions.delete(questionId);
        this.cdr.detectChanges();
      },
      error: () => this.toastService.show('Erro ao remover questão.', 'error'),
    });
  }

  public openQuestionPreview(item: any, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.previewQuestionId = this.getQuestionId(item);
    this.isPreviewModalOpen = true;
  }


  public openAddQuestionsSearch(): void { this.isSearchModalOpen = true; }
  public closeSearchModal(): void { this.isSearchModalOpen = false; }

  public closePreviewModal(): void {
    this.isPreviewModalOpen = false;
    this.previewQuestionId = '';
  }

  public addSelectedQuestions(questionIds: string[]): void {
    this.isSearchModalOpen = false;
    this.isLoading = true;

    this.simulationsService.addQuestionsToSimulation(this.simulationId!, { questionIds }).subscribe({
      next: () => this.fetchQuestions(),
      error: () => {
        this.toastService.show('Ocorreu um erro ao vincular as questões.', 'error');
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  public getSnippet(item: any): string {
    const text: string = item.question?.rawJson?.comando || '';
    if (!text) return 'Sem enunciado disponível.';
    return text.length > 180 ? text.slice(0, 180) + '…' : text;
  }
}