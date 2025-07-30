import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { FetchAllProjectRequest } from '../models/project';

interface CreateProjectRequest {
  name: string,
  author: string,
  idea: string
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor(private http: HttpClient) {}

  // Fetch all the projects or Search projects on embeddings/tags/both
  fetchAllProjects(data: FetchAllProjectRequest) {
    return this.http.post(`${environment.apiUrl}/project/get-all-projects`, data);
  }

  // Fetch a project 
  fetchProjectData(project_id: string) {
    return this.http.get(`${environment.apiUrl}/project/get-project`, {
      params: { project_id }
    });   
  }

  createProject(data: CreateProjectRequest) {
    return this.http.post(`${environment.apiUrl}/project/create-project"`, data);   
  }

  updateProject(data: any) {
    return this.http.post(`${environment.apiUrl}/project/create-project"`, data);   
  }
}
