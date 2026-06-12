import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environments'; 

@Injectable({
  providedIn: 'root',
})
export class SimulationsService {
  private api = environment.api;
  private base_url = this.api + 'simulations';
  private $http = inject(HttpClient);

  // POST /simulations
  public createSimulation(body: any): Observable<any> {
    return this.$http.post<any>(this.base_url, body);
  }


  // GET /simulations (Suporta: ?page=1&limit=20, ?userId=<uuid>)
  public getSimulations(params?: any): Observable<any> {
    return this.$http.get<any>(this.base_url, { params });
  }

  // GET /simulations/:id
  public getSimulationById(id: string): Observable<any> {
    return this.$http.get<any>(`${this.base_url}/${id}`);
  }

  // GET /simulations/:id/questions
  public getSimulationQuestions(id: string, params?: any): Observable<any> {
    return this.$http.get<any>(`${this.base_url}/${id}/questions`, { params });
  }


  // POST /simulations/generate
  // O body suporta strategy (exact_exam, random, manual), type, year, quantity, filters, etc.
  public generateSimulation(body: any): Observable<any> {
    
    return this.$http.post<any>(`${this.base_url}/generate`, body);
  }


  // POST /simulations/:id/questions
  public addQuestionsToSimulation(id: string, body: any): Observable<any> {
    return this.$http.post<any>(`${this.base_url}/${id}/questions`, body);
  }

  // DELETE /simulations/:id/questions/:questionId
  public removeQuestionFromSimulation(id: string, questionId: string): Observable<any> {
    return this.$http.delete<any>(`${this.base_url}/${id}/questions/${questionId}`);
  }

  // PATCH /simulations/:id/title
  public updateSimulationTitle(id: string, title: string): Observable<any> {
    return this.$http.patch<any>(`${this.base_url}/${id}/title`, { title });
  }
}