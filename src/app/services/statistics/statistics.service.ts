import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environments'; // Ajuste o caminho se necessário

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  private api = environment.api;
  private base_url = this.api + 'statistics';
  private $http = inject(HttpClient);

  public getOverview(): Observable<any> {
    return this.$http.get<any>(`${this.base_url}/overview`);
  }

  public getByArea(): Observable<any[]> {
    return this.$http.get<any[]>(`${this.base_url}/by-area`);
  }

  public getBySkill(): Observable<any[]> {
    return this.$http.get<any[]>(`${this.base_url}/by-skill`);
  }

  public getByCompetency(): Observable<any[]> {
    return this.$http.get<any[]>(`${this.base_url}/by-competency`);
  }

  public getMostWrong(): Observable<any[]> {
    return this.$http.get<any[]>(`${this.base_url}/most-wrong`);
  }

  public getContextComparison(): Observable<any[]> {
    return this.$http.get<any[]>(`${this.base_url}/context-comparison`);
  }

  public getEvolution(): Observable<any[]> {
    return this.$http.get<any[]>(`${this.base_url}/evolution`);
  }
}