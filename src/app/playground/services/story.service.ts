import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

interface CreateStoryRequest {
  project_id: string,
  title: string,
  structure: string,
  timeline: string
}

interface SaveStoryRequest {
  project_id: string,
  story_id: string,
  save_type: string,
  writing: string
}

@Injectable({
  providedIn: 'root'
})
export class StoryService {

  constructor(private http: HttpClient) {}
  
  createStory(data: CreateStoryRequest) {
    return this.http.post(`${environment.apiUrl}/story/create-story`, data);   
  }

  saveStory(data: SaveStoryRequest) {
    return this.http.post(`${environment.apiUrl}/story/save-story`, data);   
  }
}
