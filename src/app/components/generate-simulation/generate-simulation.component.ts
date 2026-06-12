import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SimulationsService } from '@services/simulations/simulations.service';
import { ExactExamFormComponent }  from '../exact-exam-form/exact-exam-form.component';
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
  private router             = inject(Router);

  public isLoading = signal(false);
  public title     = signal('');
  public strategy  = signal<StrategyType>('exact_exam');

  private childPayload: any = {};

  readonly strategies: { value: StrategyType; label: string; icon: string; desc: string }[] = [
    { value: 'exact_exam', label: 'Prova Oficial', icon: 'library_books', desc: 'Réplica exata de uma prova do ENEM' },
    { value: 'manual',     label: 'Manual',        icon: 'ads_click',     desc: 'Escolha cada questão individualmente' },
    { value: 'random',     label: 'Aleatório',     icon: 'shuffle',       desc: 'Sorteio com filtros pedagógicos' },
  ];

  public updateChildPayload(payload: any): void {
    this.childPayload = payload;
  }

  public createSimulation(): void {
    if (this.strategy() === 'manual' && !this.childPayload.questionIds?.length) {
      alert('Selecione pelo menos uma questão para o simulado manual.');
      return;
    }

    this.isLoading.set(true);

    const payload = {
      title:    this.title() || `Simulado — ${this.strategyLabel}`,
      strategy: this.strategy(),
      ...this.childPayload,
    };

    this.simulationsService.generateSimulation(payload).subscribe({
      next: (res: any) => {
        this.isLoading.set(false);
        const id = res?.id;
        this.router.navigate(id ? ['/attempt-sessions', id] : ['/']);
      },
      error: (err: any) => {
        console.error('Erro ao gerar simulação:', err);
        alert(err?.error?.message || 'Erro ao criar simulação. Tente novamente.');
        this.isLoading.set(false);
      },
    });
  }

  private get strategyLabel(): string {
    return this.strategies.find(s => s.value === this.strategy())?.label ?? this.strategy();
  }
}