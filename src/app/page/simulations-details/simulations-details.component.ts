import { ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SimulationsService } from '@services/simulations/simulations.service';
import { AttemptSessionsService } from '@services/attempt-sessions/attempt-sessions.service';
import { QuestionPreviewComponent } from "@components/questions-preview/questions-preview.component";
import { QuestionSearchModalComponent } from "@components/question-search-modal/question-search-modal.component";

@Component({
  selector: 'app-simulations-details',
  templateUrl: './simulations-details.component.html',
  styleUrls: ['./simulations-details.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, QuestionPreviewComponent, QuestionSearchModalComponent]
})
export class SimulationsDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private simulationsService = inject(SimulationsService);
  private attemptSessionsService = inject(AttemptSessionsService);
  private cdr = inject(ChangeDetectorRef);

  public isLoading = true;
  public isStartingSession = false;
  public simulationId: string | null = null;

  public simulationDetails: any = null;
  public questions: any[] = [];

  // Edição de Título
  public isEditingTitle = false;
  public editTitleValue = '';

  // Seleção de Questões
  public selectedQuestions = new Set<string>();

  // Modais
  public isPreviewModalOpen = false;
  public previewQuestionId = '';
  public isSearchModalOpen = false;

  ngOnInit(): void {
    this.simulationId = this.route.snapshot.paramMap.get('simulationId');
    if (this.simulationId) {
      this.fetchQuestions();
    }
  }

  // ── Carregamento de Dados ───────────────────────────────────────────────
  private fetchQuestions(): void {
    this.isLoading = true;
    this.simulationsService.getSimulationQuestions(this.simulationId!).subscribe({
      next: (res: any) => {
        this.simulationDetails = res.simulation || res.data?.simulation || res;
        this.questions = res.questions || res.items || res.data?.questions || [];
        this.editTitleValue = this.simulationDetails?.title || '';
        this.selectedQuestions.clear();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        alert('Erro ao carregar os detalhes do simulado.');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ── Edição de Título ────────────────────────────────────────────────────
  public startEditingTitle(): void {
    this.editTitleValue = this.simulationDetails?.title || '';
    this.isEditingTitle = true;
  }

  public saveTitle(): void {
    if (!this.editTitleValue.trim()) return;
    
    this.simulationsService.updateSimulationTitle(this.simulationId!, this.editTitleValue).subscribe({
      next: () => {
        this.simulationDetails.title = this.editTitleValue;
        this.isEditingTitle = false;
        this.cdr.detectChanges();
      },
      error: () => {
        alert('Erro ao atualizar o título.');
        this.isEditingTitle = false;
      }
    });
  }

  // ── Seleção de Questões ─────────────────────────────────────────────────
  public toggleSelection(questionId: string): void {
    if (this.selectedQuestions.has(questionId)) {
      this.selectedQuestions.delete(questionId);
    } else {
      this.selectedQuestions.add(questionId);
    }
  }

  public toggleAll(): void {
    if (this.selectedQuestions.size === this.questions.length) {
      this.selectedQuestions.clear();
    } else {
      this.questions.forEach(q => this.selectedQuestions.add(q.question?.id || q.id));
    }
  }

  public isAllSelected(): boolean {
    return this.questions.length > 0 && this.selectedQuestions.size === this.questions.length;
  }

  // ── Iniciar Simulado (Avulso com Selecionadas) ──────────────────────────
  public startSelectedPractice(): void {
    if (this.selectedQuestions.size === 0) return;
    
    this.isStartingSession = true;

    const payload = {
      title: `Treino: ${this.simulationDetails?.title || 'Personalizado'}`,
      questionIds: Array.from(this.selectedQuestions)
    };

    this.attemptSessionsService.createAvulsoSession(payload).subscribe({
      next: (res) => {
        this.isStartingSession = false;
        // Navega para a tela de resolução com o ID da sessão criada
        this.router.navigate(['/attempt-sessions-avulso', res.id]);
      },
      error: (err) => {
        console.error('Erro ao iniciar treino avulso:', err);
        alert('Erro ao preparar o simulado. Tente novamente.');
        this.isStartingSession = false;
      }
    });
  }

  // ── Ações em Questões Individuais ───────────────────────────────────────
  public removeQuestion(questionId: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Deseja realmente remover esta questão do simulado?')) {
      this.simulationsService.removeQuestionFromSimulation(this.simulationId!, questionId).subscribe({
        next: () => {
          this.questions = this.questions.filter(q => (q.question?.id || q.id) !== questionId);
          this.selectedQuestions.delete(questionId);
          this.cdr.detectChanges();
        },
        error: () => {
          alert('Erro ao remover questão. (Backend não implementado?)');
        }
      });
    }
  }

  public openQuestionPreview(question: any, event: Event): void {
    event.stopPropagation();
    this.previewQuestionId = question.question?.id || question.id;
    this.isPreviewModalOpen = true;
  }

  // ── Controlo de Modais ──────────────────────────────────────────────────
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
        alert('Ocorreu um erro ao vincular as questões.');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}