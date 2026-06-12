import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environments';

export interface ExamFilters {
  type?: 'REGULAR' | 'PPL';
  year?: number;
  day?: 'D1' | 'D2';
}

export interface ExamItem {
  id: string;
  year: number;
  type: 'REGULAR' | 'PPL';
  day: 'D1' | 'D2';
  _count: { questions: number };
}

export interface ExamsResponse {
  data: ExamItem[];
  meta: { total: number };
}

@Injectable({ providedIn: 'root' })
export class ExamsService {
  private base_url = environment.api + 'exams';
  private $http    = inject(HttpClient);

  // GET /exams?type=PPL&year=2015&day=D1
  public getExams(filters: ExamFilters): Observable<ExamsResponse> {
    const params = this.buildParams(filters);
    return this.$http.get<ExamsResponse>(this.base_url, { params });
  }

  // GET /exams/questions?type=PPL&year=2015&day=D1
  public getExamQuestions(filters: ExamFilters): Observable<any[]> {
    const params = this.buildParams(filters);
    return this.$http.get<any[]>(`${this.base_url}/questions`, { params });
  }

  // GET /exams/:id/questions
  public getExamQuestionsById(id: string): Observable<any[]> {
    return this.$http.get<any[]>(`${this.base_url}/${id}/questions`);
  }

  // Monta params limpando valores undefined/null/''
  private buildParams(filters: ExamFilters): Record<string, string> {
    return Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== undefined && v !== null && v !== '')
    ) as Record<string, string>;
  }
}