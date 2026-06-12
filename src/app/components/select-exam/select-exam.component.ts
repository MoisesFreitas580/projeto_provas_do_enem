import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ExamsService, ExamItem, ExamFilters } from '@services/exams/exams.service';
import { AttemptSessionsService } from '@services/attempt-sessions/attempt-sessions.service'

type ExamType = 'REGULAR' | 'PPL';
type ExamDay = 'D1' | 'D2' | '';

const CURRENT_YEAR = new Date().getFullYear();
const EXAM_YEARS = Array.from({ length: CURRENT_YEAR - 2008 }, (_, i) => CURRENT_YEAR - i);

@Component({
  selector: 'app-select-exam',
  templateUrl: './select-exam.component.html',
  styleUrls: ['./select-exam.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class SelectExamComponent {
  private examsService = inject(ExamsService);
  private attemptSessionsService = inject(AttemptSessionsService);
  private router = inject(Router);

  public selectedType = signal<ExamType>('REGULAR');
  public selectedYear = signal<number | null>(null);
  public selectedDay = signal<ExamDay>('');

  public isLoading = signal(false);
  public hasSearched = signal(false);
  public exams = signal<ExamItem[]>([]);
  public errorMsg = signal<string | null>(null);
  public creatingSessionId = signal<string | null>(null);

  readonly years = EXAM_YEARS;
  readonly examTypes: { value: ExamType; label: string; desc: string }[] = [
    { value: 'REGULAR', label: 'Regular', desc: 'Prova aplicada em todo o Brasil' },
    { value: 'PPL', label: 'PPL', desc: 'Reaplicação (Privados de Liberdade)' },
  ];
  readonly days: { value: ExamDay; label: string; desc: string }[] = [
    { value: '', label: 'Ambos os dias', desc: 'D1 + D2 juntos' },
    { value: 'D1', label: 'Dia 1', desc: 'Linguagens e Humanas' },
    { value: 'D2', label: 'Dia 2', desc: 'Natureza e Matemática' },
  ];

  public canSearch = computed(() => this.selectedYear() !== null);

  public search(): void {
    if (!this.canSearch()) return;

    this.isLoading.set(true);
    this.hasSearched.set(false);
    this.errorMsg.set(null);

    const filters: ExamFilters = {
      type: this.selectedType(),
      year: this.selectedYear()!,
    };
    if (this.selectedDay()) filters.day = this.selectedDay() as 'D1' | 'D2';

    this.examsService.getExams(filters).subscribe({
      next: (res) => {
        this.exams.set(res.data || []);
        this.isLoading.set(false);
        this.hasSearched.set(true);
      },
      error: () => {
        this.errorMsg.set('Erro ao buscar as provas. Verifique os filtros e tente novamente.');
        this.isLoading.set(false);
        this.hasSearched.set(true);
      },
    });
  }

  public selectExam(exam: ExamItem): void {
    if (this.creatingSessionId()) return;

    this.creatingSessionId.set(exam.id);

    const payload = {
      examId: exam.id,
      title: `ENEM ${exam.year} ${exam.type} ${exam.day}`
    };

    this.attemptSessionsService.createExamSession(payload).subscribe({
      next: (sessionResponse) => {
        this.creatingSessionId.set(null);
        this.router.navigate(['/attempt-sessions-exam', sessionResponse.id]);
      },
      error: (err) => {
        console.error('Erro ao criar a sessão da prova:', err);
        alert('Ocorreu um erro ao preparar a sua prova. Tente novamente.');
        this.creatingSessionId.set(null);
      }
    });
  }

  public getDayLabel(day: string): string {
    return day === 'D1' ? 'Dia 1' : day === 'D2' ? 'Dia 2' : day;
  }

  public getAreaBadges(exam: ExamItem): string[] {
    if (exam.day === 'D1') return ['LC', 'CH'];
    if (exam.day === 'D2') return ['CN', 'MT'];
    return ['LC', 'CH', 'CN', 'MT'];
  }

  public resetFilters(): void {
    this.selectedYear.set(null);
    this.selectedDay.set('');
    this.exams.set([]);
    this.hasSearched.set(false);
    this.errorMsg.set(null);
  }
}