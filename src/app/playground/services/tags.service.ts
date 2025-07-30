import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { SearchTagsRequest } from '../models/tags';

@Injectable({
  providedIn: 'root'
})

export class TagsService {

  constructor(private http: HttpClient) {}

  searchForTags(data: SearchTagsRequest) {
    console.log(data)
    return this.http.post(`${environment.apiUrl}/llm/suggest-tags`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  getTagDemographics(tag_id: string) {
    return this.http.get(`${environment.apiUrl}/qloo/get-tag-info`, { params: { tag_id } });
  }
}
