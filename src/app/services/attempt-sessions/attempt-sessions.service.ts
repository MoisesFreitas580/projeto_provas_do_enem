import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environments';

@Injectable({
    providedIn: 'root',
})
export class AttemptSessionsService {
    private api = environment.api;
    private base_url = this.api + 'attempt-sessions';
    private $http = inject(HttpClient);

    // GET /attempt-sessions/:id
    public getSessionById(sessionId: string): Observable<any> {
        console.log(`${this.base_url}/${sessionId}`);
        return this.$http.get<any>(`${this.base_url}/${sessionId}`);
    }

    // PATCH /attempt-sessions/:sessionId/answers/:questionId
    public answerQuestion(sessionId: string, questionId: string, payload: any): Observable<any> {
        return this.$http.patch<any>(`${this.base_url}/${sessionId}/answers/${questionId}`, payload);
    }

    // POST /attempt-sessions/:sessionId/abandon
    public abandonSession(sessionId: string): Observable<any> {
        return this.$http.post<any>(`${this.base_url}/${sessionId}/abandon`, {});
    }

    // POST /attempt-sessions/:sessionId/correct
    public correctSession(sessionId: string): Observable<any> {
        return this.$http.post<any>(`${this.base_url}/${sessionId}/correct`, {});
    }

    // POST /attempt-sessions/exam
    public createExamSession(payload: { examId: string, title: string }): Observable<any> {
        return this.$http.post<any>(`${this.base_url}/exam`, payload);
    }

    // POST /attempt-sessions/simulation
    public createSimulationSession(payload: { simulationId: string, title: string }): Observable<any> {
        return this.$http.post<any>(`${this.base_url}/simulation`, payload);
    }
    
    // POST /attempt-sessions/avulso
    public createAvulsoSession(payload: { title: string, questionIds: string[] }): Observable<any> {
        return this.$http.post<any>(`${this.base_url}/avulso`, payload);
    }
}