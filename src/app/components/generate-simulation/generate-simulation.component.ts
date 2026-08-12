import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SimulationsService } from '@services/simulations/simulations.service';
import { AttemptSessionsService } from '@services/attempt-sessions/attempt-sessions.service';
import { ToastService } from '@components/toast/toast.component.service';
import { ExactExamFormComponent } from '../exact-exam-form/exact-exam-form.component';
import { RandomExamFormComponent } from '../random-exam-form/random-exam-form.component';
import { ManualExamFormComponent } from '../manual-exam-form/manual-exam-form.component';

type StrategyType = 'exact_exam' | 'manual' | 'random';

@Component({
  selector: 'app-generate-simulation',
  standalone: true,
  imports: [CommonModule, FormsModule, ExactExamFormComponent, RandomExamFormComponent, ManualExamFormComponent],
  templateUrl: './generate-simulation.component.html',
  styleUrls: ['./generate-simulation.component.scss'],
})
export class GenerateSimulationComponent {
  private simulationsService = inject(SimulationsService);
  private attemptSessionsService = inject(AttemptSessionsService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  public isLoading = signal(false);
  public title = signal('');
  public strategy = signal<StrategyType>('exact_exam');

  private childPayload: any = {};

  readonly strategies: { value: StrategyType; label: string; icon: string; desc: string }[] = [
    { value: 'exact_exam', label: 'Prova Oficial', icon: 'library_books', desc: 'Réplica exata de uma prova do ENEM' },
    { value: 'manual', label: 'Manual', icon: 'ads_click', desc: 'Escolha cada questão individualmente' },
    { value: 'random', label: 'Aleatório', icon: 'shuffle', desc: 'Sorteio com filtros pedagógicos' },
  ];

  public updateChildPayload(payload: any): void {
    this.childPayload = payload;
  }

  public createSimulation(): void {
    if (this.strategy() === 'manual' && !this.childPayload.questionIds?.length) {
      this.toastService.show('Selecione pelo menos uma questão para o simulado manual.', 'error');
      return;
    }

    this.isLoading.set(true);

    const payload = {
      title: this.title() || `Simulado — ${this.strategyLabel}`,
      strategy: this.strategy(),
      ...this.childPayload,
    };

    this.simulationsService.generateSimulation(payload).subscribe({
      next: (res: any) => {
        // POST /simulations/generate retorna { strategy, requestedQuantity, returnedQuantity, simulation }
        const simulation = res?.simulation ?? res;
        const simulationId = simulation?.id;

        if (!simulationId) {
          this.isLoading.set(false);
          this.toastService.show('Simulado criado, mas não foi possível iniciá-lo automaticamente.', 'error');
          this.router.navigate(['/']);
          return;
        }

        this.attemptSessionsService.createSimulationSession({
          simulationId,
          title: simulation.title || payload.title,
        }).subscribe({
          next: (session) => {
            this.isLoading.set(false);
            this.router.navigate(['/attempt-sessions-simulation', session.id]);
          },
          error: () => {
            this.isLoading.set(false);
            this.toastService.show('Simulado criado, mas houve um erro ao iniciar a sessão.', 'error');
            this.router.navigate(['/']);
          },
        });
      },
      error: (err: any) => {
        console.error('Erro ao gerar simulação:', err);
        this.toastService.show(err?.error?.message || 'Erro ao criar simulação. Tente novamente.', 'error');
        this.isLoading.set(false);
      },
    });
  }

  private get strategyLabel(): string {
    return this.strategies.find(s => s.value === this.strategy())?.label ?? this.strategy();
  }
}