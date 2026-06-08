import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environments'; // Lembre-se de importar o seu environment

@Injectable({
  providedIn: 'root',
})
export class CatalogService {
  private api = environment.api;
  private catalog_url = this.api + 'catalog/';
  private $http = inject(HttpClient);

  // GET /catalog/areas
  public getAreas(): Observable<any> {
    return this.$http.get<any>(`${this.catalog_url}areas`);
  }

  // GET /catalog/disciplines
  public getDisciplines(params?: any): Observable<any> {
    return this.$http.get<any>(`${this.catalog_url}disciplines`, { params });
  }

  // GET /catalog/competencies
  public getCompetencies(params?: any): Observable<any> {
    return this.$http.get<any>(`${this.catalog_url}competencies`, { params });
  }

  // GET /catalog/skills
  public getSkills(params?: any): Observable<any> {
    return this.$http.get<any>(`${this.catalog_url}skills`, { params });
  }

  // GET /catalog/knowledge-objects
  public getKnowledgeObjects(params?: any): Observable<any> {
    return this.$http.get<any>(`${this.catalog_url}knowledge-objects`, { params });
  }

  // GET /catalog/contents
  public getContents(params?: any): Observable<any> {
    return this.$http.get<any>(`${this.catalog_url}contents`, { params });
  }
}