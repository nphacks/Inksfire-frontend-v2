import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AiService {

  constructor(private http: HttpClient) { }

  generateThreeIdeas() {
    return this.http.get(`${environment.apiUrl}/llm/generate-ideas`);   
  }
}
