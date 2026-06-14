import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environments'; 

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private api = environment.api;
  private base_url = this.api + 'users';
  private $http = inject(HttpClient);

  // GET /users/me
  public getMe(): Observable<any> {
    return this.$http.get<any>(`${this.base_url}/me`);
  }

  // PATCH /users/me
  public updateMe(payload: { name: string }): Observable<any> {
    return this.$http.patch<any>(`${this.base_url}/me`, payload);
  }

  // DELETE /users/me
  public deleteMe(): Observable<any> {
    return this.$http.delete<any>(`${this.base_url}/me`);
  }
}