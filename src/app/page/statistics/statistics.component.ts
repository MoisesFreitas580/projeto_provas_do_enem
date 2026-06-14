import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { StatisticsService } from '@services/statistics/statistics.service';
import { ToastService } from '@components/toast/toast.component.service';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {
  private statisticsService = inject(StatisticsService);
  private toastService = inject(ToastService);

  public isLoading = signal(true);

  // Estados dos dados
  public overview: any = null;
  public byArea: any[] = [];
  public bySkill: any[] = [];
  public byCompetency: any[] = [];
  public mostWrong: any[] = [];
  public contextComparison: any[] = [];
  public evolution: any[] = [];

  ngOnInit(): void {
    this.loadAllStatistics();
  }

  private loadAllStatistics(): void {
    this.isLoading.set(true);

    // Faz as 7 requisições em paralelo
    forkJoin({
      overview: this.statisticsService.getOverview(),
      byArea: this.statisticsService.getByArea(),
      bySkill: this.statisticsService.getBySkill(),
      byCompetency: this.statisticsService.getByCompetency(),
      mostWrong: this.statisticsService.getMostWrong(),
      contextComparison: this.statisticsService.getContextComparison(),
      evolution: this.statisticsService.getEvolution()
    }).subscribe({
      next: (results) => {
        this.overview = results.overview;
        this.byArea = results.byArea;
        this.bySkill = results.bySkill;
        this.byCompetency = results.byCompetency;
        this.mostWrong = results.mostWrong;
        this.contextComparison = results.contextComparison;
        this.evolution = results.evolution;
        
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao buscar estatísticas', err);
        this.toastService.show('Não foi possível carregar as suas estatísticas.', 'error');
        this.isLoading.set(false);
      }
    });
  }

  // ── Formatação de Tempo ────────────────────────────────────────────────
  public formatTime(ms: number | undefined): string {
    if (!ms) return '0s';
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  }

  // Formatação amigável para contextos
  public formatContextType(type: string): string {
    const map: Record<string, string> = {
      'EXAM': 'Provas Oficiais',
      'SIMULATION': 'Simulados',
      'AVULSO': 'Treino Avulso'
    };
    return map[type] || type;
  }
}