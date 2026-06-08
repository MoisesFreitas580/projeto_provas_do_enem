import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environments';  

@Injectable({
  providedIn: 'root',
})
export class QuestionsService {
  private api = environment.api; 
  private base_url = this.api + 'questions';
  private $http = inject(HttpClient);

 
  public getQuestions(params?: any): Observable<any> {
    console.log(this.base_url, { params }); 
    return this.$http.get<any>(this.base_url, { params });
  }

  public getQuestionById(id: string): Observable<any> {
    console.log(`${this.base_url}/${id}`);
    return this.$http.get<any>(`${this.base_url}/${id}`);
  }

}