import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectDataService {

  constructor() { }

  private projectSource = new BehaviorSubject<any>(null);
  project$ = this.projectSource.asObservable();

  setProject(project: any) {
    this.projectSource.next(project);
  }
}
