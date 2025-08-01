import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BackendHealthService {

  constructor(private http: HttpClient) { }

  checkBackendHealth(): Observable<any> {
    // Simulate backend wake-up call
    // In real implementation, this would be a health check endpoint
    return this.http.get(`${environment.apiUrl}/health`).pipe(
      // Add a minimum delay to show the loading state
      delay(2000)
    );
  }

  // Fallback simulation if backend is not available
  simulateBackendWakeup(): Observable<any> {
    return of({ status: 'ok', message: 'Backend is ready' }).pipe(
      delay(3000) // Simulate 3 second wake-up time
    );
  }
}