import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { Observable, map } from 'rxjs';
import { SimulationsService } from '@services/simulations/simulations.service';
import { AuthService } from '@helpers/auth.service';
import { RouterLink } from '@angular/router';
import { CreateSimulationModalComponent } from '@components/create-simulation-modal/create-simulation-modal.component';

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
    attemptSessions?: number;   // ← nome atualizado conforme novo JSON
  };
}

// Novo formato de resposta: { data: [...], meta: {...} }
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
  imports: [RouterLink, AsyncPipe, CreateSimulationModalComponent],
  standalone: true,
})
export class UserSimulationsComponent implements OnInit {
  private simulationsService = inject(SimulationsService);
  private authService = inject(AuthService);

  protected readonly Object = Object;

  public userSimulations$!: Observable<SimulationItem[]>;
  public isModalOpen = false;

  ngOnInit(): void {
    this.fetchUserSimulations();
  }

  public openModal(): void { this.isModalOpen = true; }
  public closeModal(wasCreated: boolean = false): void {
    this.isModalOpen = false;
    if (wasCreated) {
      this.fetchUserSimulations();
    }
  }

  public getDisplayTitle(sim: SimulationItem): string {
    return sim.title?.trim() || 'Simulação sem título';
  }

  public filterCount(filters: SimulationFilters | null): number {
    if (!filters) return 0;
    return Object.values(filters).filter(v => v !== undefined && v !== null).length;
  }



  public editSimulation(sim: any, event: Event): void {
    event.stopPropagation();
    alert(`Modo de edição da simulação "${sim.title}" em desenvolvimento.`);
  }

  public deleteSimulation(id: string, event: Event): void {
    event.stopPropagation();
    const confirm = window.confirm('Deseja apenas simular a remoção deste simulado no design?');
    if (confirm) {
      alert('Remoção visual ativada. Backend ainda não implementado.');
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
          questionsCount: item._count?.simulationQuestions ?? 0,
          attemptsCount: item._count?.attemptSessions ?? 0,   
        }));
      })
    );
  }
}