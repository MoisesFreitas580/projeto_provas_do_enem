import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SimulationsService } from '@services/simulations/simulations.service';
import { QuestionPreviewComponent } from "@components/questions-preview/questions-preview.component";
import { QuestionSearchModalComponent } from "@components/question-search-modal/question-search-modal.component";

@Component({
  selector: 'app-simulations-details',
  templateUrl: './simulations-details.component.html',
  styleUrls: ['./simulations-details.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, QuestionPreviewComponent, QuestionSearchModalComponent]
})
export class SimulationsDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private simulationsService = inject(SimulationsService);
  private cdr = inject(ChangeDetectorRef);

  public isLoading: boolean = true;
  public simulationId: string | null = null;

  public simulationDetails: any = null;
  public questions: any[] = [];


  public isPreviewModalOpen: boolean = false;
  public previewQuestionId: string = '';

  public isSearchModalOpen: boolean = false;

  public closePreviewModal(): void {
    this.isPreviewModalOpen = false;
    this.previewQuestionId = '';
  }

  ngOnInit(): void {
    this.simulationId = this.route.snapshot.paramMap.get('id');
    if (this.simulationId) {
      this.fetchSimulationData();
    }
  }

  private fetchSimulationData(): void {
    this.isLoading = true;

    this.simulationsService.getSimulationById(this.simulationId!).subscribe({
      next: (sim) => {
        this.simulationDetails = sim;
        this.fetchQuestions();
      },
      error: () => this.fetchQuestions()
    });
  }

  private fetchQuestions(): void {
    this.simulationsService.getSimulationQuestions(this.simulationId!, { page: 1, limit: 100 }).subscribe({
      next: (res: any) => {
        this.questions = res.items || res.data || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erro ao buscar questões:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }


  public removeQuestion(questionId: string): void {
    if (confirm('Tem certeza que deseja remover esta questão do simulado?')) {
      this.simulationsService.removeQuestionFromSimulation(this.simulationId!, questionId).subscribe({
        next: () => {
          this.questions = this.questions.filter(q => (q.question?.id || q.id) !== questionId);
          this.cdr.detectChanges();
        },
        error: () => {
          alert('Aviso: Backend não implementado. Removendo apenas visualmente.');
          this.questions = this.questions.filter(q => (q.question?.id || q.id) !== questionId);
        }
      });
    }
  }

  public openQuestionPreview(question: any): void {
    this.previewQuestionId = question.question.id;
    this.isPreviewModalOpen = true;
  }


  public addSelectedQuestions(questionIds: string[]): void {
    this.isSearchModalOpen = false; 
    this.isLoading = true; 

    const payload = { questionIds: questionIds };

    this.simulationsService.addQuestionsToSimulation(this.simulationId!, payload).subscribe({
      next: () => {
        this.fetchQuestions();
      },
      error: (err) => {
        console.error('Erro ao vincular questões:', err);
        alert('Ocorreu um erro ao vincular as questões ao simulado.');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }


  public openAddQuestionsSearch(): void {
    this.isSearchModalOpen = true;
    console.log(this.isSearchModalOpen);
  }

  public closeSearchModal(): void {
    this.isSearchModalOpen = false;
  }
}