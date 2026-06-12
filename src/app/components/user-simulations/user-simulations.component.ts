import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { Observable, map } from 'rxjs';
import { SimulationsService } from '@services/simulations/simulations.service';
import { Router, RouterLink } from '@angular/router';
import { AttemptSessionsService } from '@services/attempt-sessions/attempt-sessions.service';

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
  _count?: {
    simulationQuestions?: number;
    attemptSessions?: number;
  };
}

interface ApiResponse {
  data: ApiSimulationItem[];
  meta?: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

@Component({
  selector: 'app-user-simulations',
  templateUrl: './user-simulations.component.html',
  styleUrls: ['./user-simulations.component.scss'],
  imports: [RouterLink, AsyncPipe],
  standalone: true,
})
export class UserSimulationsComponent implements OnInit {
  private simulationsService = inject(SimulationsService);
  private router = inject(Router);
  private attemptSessionsService = inject(AttemptSessionsService);

  public startingSessionId: string | null = null;
  public userSimulations$!: Observable<SimulationItem[]>;

  ngOnInit(): void {
    this.fetchUserSimulations();
  }

  public getDisplayTitle(sim: SimulationItem): string {
    return sim.title?.trim() || 'Simulação sem título';
  }



  public startSimulation(sim: SimulationItem): void {

    if (this.startingSessionId) return; 
    this.startingSessionId = sim.id;

    const payload = {
      simulationId: sim.id,
      title: sim.title || 'Simulado Personalizado'
    };
    this.attemptSessionsService.createSimulationSession(payload).subscribe({
      next: (sessionResponse) => {
        this.startingSessionId = null;
        this.router.navigate(['/attempt-sessions-simulation', sessionResponse.id]);
      },
      error: (err) => {
        console.error('Erro ao iniciar simulado:', err);
        alert('Erro ao preparar o seu simulado. Tente novamente.');
        this.startingSessionId = null;
      }
    });
  }

public editSimulation(sim: any, event: Event): void {
    event.stopPropagation();

    this.router.navigate(['/simulations-details', sim.id]);
  }

  public deleteSimulation(id: string, event: Event): void {
    event.stopPropagation();
    const confirm = window.confirm('Tem a certeza que deseja excluir este simulado permanentemente?');
    if (confirm) {
      alert('Exclusão ativada (Preparado para atualização futura do backend).');
    }
  }


  private fetchUserSimulations(): void {
    this.userSimulations$ = this.simulationsService.getSimulations().pipe(
      map((response: ApiResponse) => {
        const items = response.data || [];

        return items.map((item: ApiSimulationItem) => ({
          id: item.id,
          title: item.title,
          filters: item.filters,
          questionsCount: item._count?.simulationQuestions || 0,
          attemptsCount: item._count?.attemptSessions || 0
        }));
  
      })
    );

  }
}