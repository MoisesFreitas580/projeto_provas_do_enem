import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Observable, map } from 'rxjs';
import { SimulationsService } from '@services/simulations/simulations.service';
import { Router, RouterLink } from '@angular/router';
import { AttemptSessionsService } from '@services/attempt-sessions/attempt-sessions.service';
import { ToastService } from '@components/toast/toast.component.service';
import { ConfirmService } from '@components/confirm/confirm.component.service';

export interface SimulationFilters {
  area?: string;
  competencyCode?: string;
  skillCode?: string;
  day?: string;
  year?: number;
  type?: string;
  [key: string]: any;
}

export interface SimulationItem {
  id: string;
  title: string | null;
  filters: SimulationFilters | null;
  questionsCount: number;
  attemptsCount: number;
}

interface ApiSimulationItem {
  id: string;
  title: string | null;
  filters: SimulationFilters | null;
  _count?: { simulationQuestions?: number; attemptSessions?: number };
}

interface ApiResponse {
  data: ApiSimulationItem[];
  meta?: { total: number; page: number; perPage: number; totalPages: number };
}

@Component({
  selector: 'app-user-simulations',
  templateUrl: './user-simulations.component.html',
  styleUrls: ['./user-simulations.component.scss'],
  imports: [RouterLink, AsyncPipe],
  standalone: true,
})
export class UserSimulationsComponent implements OnInit {
  private simulationsService     = inject(SimulationsService);
  private attemptSessionsService = inject(AttemptSessionsService);
  private toastService           = inject(ToastService);
  private confirmService         = inject(ConfirmService);
  private router                 = inject(Router);

  public userSimulations$!: Observable<SimulationItem[]>;
  public startingSessionId: string | null = null;

  protected readonly Object = Object;

  ngOnInit(): void {
    this.fetchUserSimulations();
  }

  public getDisplayTitle(sim: SimulationItem): string {
    return sim.title?.trim() || 'Simulação sem título';
  }

  public isStarting(sim: SimulationItem): boolean {
    return this.startingSessionId === sim.id;
  }

  public startSimulation(sim: SimulationItem): void {
    if (this.startingSessionId) return;
    this.startingSessionId = sim.id;

    const payload = {
      simulationId: sim.id,
      title: sim.title || 'Simulado Personalizado',
    };

    this.attemptSessionsService.createSimulationSession(payload).subscribe({
      next: (res) => {
        this.router.navigate(['/attempt-sessions-simulation', res.id]);
      },
      error: (err) => {
        console.error('Erro ao iniciar simulado:', err);
        this.toastService.show('Erro ao preparar o seu simulado. Tente novamente.', 'error');
        this.startingSessionId = null;
      },
    });
  }

  public editSimulation(sim: SimulationItem, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/simulations-details', sim.id]);
  }

  public async deleteSimulation(id: string, event: Event): Promise<void> {
    event.stopPropagation();

    const confirmed = await this.confirmService.ask(
      'Excluir Simulado',
      'Tem a certeza que deseja excluir este simulado permanentemente?',
      'Sim, Excluir',
      'Cancelar'
    );
    if (!confirmed) return;

    // TODO: chamar o endpoint real assim que DELETE /simulations/:id existir na API
    this.toastService.show('Exclusão ainda não disponível — endpoint pendente no backend.', 'info');
  }

  private fetchUserSimulations(): void {
    this.userSimulations$ = this.simulationsService.getSimulations().pipe(
      map((response: ApiResponse) =>
        (response.data || []).map((item: ApiSimulationItem) => ({
          id: item.id,
          title: item.title,
          filters: item.filters,
          questionsCount: item._count?.simulationQuestions ?? 0,
          attemptsCount: item._count?.attemptSessions ?? 0,
        }))
      )
    );
  }
}