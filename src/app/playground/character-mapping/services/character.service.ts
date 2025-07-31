import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class CharacterService {

  constructor(private http: HttpClient) {}
  
  fetchCharacterMapping(project_id: string, story_id: string) {
    return this.http.get(`${environment.apiUrl}/project/get-project`, {
      params: { project_id }
    });  
  }
}
