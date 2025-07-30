import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../services/project.service';
import { ProjectDataService } from '../services/project-data.service';
import { Router } from '@angular/router';
import { AiService } from './services/ai.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  
  projects: any[] = [];
  isLoading = false;
  filteredProjects: any[] = [];
  selectedAction: string = 'plan';
  generatedIdeas: string[] = []
  showCreatePopup = false;
  currentStep = 1;
  newProject = {
    name: '',
    author: '',
    idea: ''
  };
  story_genres = [ 'Any', 'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Musical',
  'Mystery', 'Romance', 'Sci-Fi', 'Short', 'Sport', 'Thriller', 'War', 'Western' ];
  selectedGenres: string[] = ['Any'];

  story_types = [ 'Any', 'Movies', 'Tv Show', 'Book']
  selectedStoryType: string = 'Any'
  newProjectPrompt: string = ''
  generatedPrompts = []

  constructor(
    private projectService: ProjectService, 
    private projectDataService: ProjectDataService,
    private aiService: AiService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadProjects()
  }

  loadProjects() {
    this.isLoading = true;
    this.fetchAllProject('', []);
  }

  fetchAllProject(search: string, tags: any[]) {
   this.isLoading = true;
   this.projectService.fetchAllProjects({
      search: search,
      tags: tags
    }).subscribe({
      next: (res: any) => {
        console.log(res.projects);
        this.projects = res.projects || [];
        this.filteredProjects = this.projects
        this.isLoading = false;
        // The response: 
        // {
        //   "status_code": 200,
        //   "message": "Projects fetched!",
        //   "projects": [
        //       {
        //           "author": "John Doe",
        //           "idea": "A window woman begins to live her childhood dream of riding motorbike.",
        //           "project_id": "397d398a-52d0-4353-b8fc-92c8ecbd1ffd",
        //           "genre": [ "adventure" ]
        //           "story_types": [ "movie" ]
        //       }
        //   ]
        // }
      },
      error: (err) => {
        this.isLoading = false;
        this.projects = [];
        console.error('Error:', err.error); //The response: {detail: 'Not found'}
        console.error('Error status code:', err.status); //The response is staus code: 404
      }
    })
  }

  selectProject(projectId: string) {
    console.log('Selecting project', projectId)
    // Fetch project data and set it in the service
    this.projectService.fetchProjectData(projectId).subscribe({
      next: (res: any) => {
        console.log('Selected project response', res)
        this.projectDataService.setProject(res.project);
        this.router.navigate(['/playground/story-writing'], { 
          queryParams: { 
            project_id: projectId,
            is_new: false,
            is_plan: false
          } 
        });
      },
      error: (err) => {
        console.error('Error fetching project:', err);
      }
    });
  }

  createProject() {
    this.projectService.createProject(this.newProject).subscribe({
      next: (res: any) => {
        let projectId = res.project.id
        this.projectDataService.setProject(res.project);
        if (res.status_code === 200 && this.selectedAction === 'start') {
          this.startWriting(projectId);
        } 
      }
    })
  }

  submitPrompt() {
    this.projectService.updateProject({
      "genres": this.selectedGenres,
      "story_types": [this.selectedStoryType],
      "prompt": this.newProjectPrompt
    }).subscribe({
      next: (res: any) => {
        let projectId = res.project.id
        this.projectDataService.setProject(res.project);
        if (res.status_code === 200 && this.selectedAction === 'plan') {
          this.planWriting(projectId);
        } 
      }
    })
  }

  startWriting(projectId: string) {
    this.router.navigate(['/playground/story-writing'], { 
      queryParams: { 
        project_id: projectId,
        is_new: true,
        is_plan: false
      } 
    });
  }

  planWriting(projectId: string) {
    this.router.navigate(['/playground/story-writing'], { 
      queryParams: { 
        project_id: projectId,
        is_new: true,
        is_plan: true
      } 
    });
  }

  generateIdeas() {
    this.aiService.generateThreeIdeas().subscribe({
      next: (res: any) => {
        this.generatedIdeas = res.ideas
      },
      error: (err) => {
        console.error('Error fetching project:', err);
      }
    })
  }

  closePopup() {
    this.showCreatePopup = false;
    this.currentStep = 1;
    this.resetForm();
  }

  nextStep() {
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  selectIdea(idea: string) {
    this.newProject.idea = idea;
  }

  selectPrompt(prompt: string) {
    this.newProjectPrompt = prompt;
  }

  resetForm() {
    this.newProject = {
      name: '',
      author: '',
      idea: ''
    };
    this.selectedGenres = ['Any'];
    this.selectedStoryType = 'Any';
    this.newProjectPrompt = '';
    this.generatedIdeas = [];
    this.generatedPrompts = [];
  }
}
