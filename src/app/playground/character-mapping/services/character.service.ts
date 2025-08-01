import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class CharacterService {

  constructor(private http: HttpClient) {}

  searchForActors(data: any) {
    return this.http.get(`${environment.apiUrl}/qloo/get-actor-info`, {
      params: { movie_search_Str: data }
    });   
  }
}


